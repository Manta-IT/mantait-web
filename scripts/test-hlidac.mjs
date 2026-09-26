// T0926-211: tracer hlidace vyzev -- prihlaseni -> zapis `zapsan` -> potvrzovaci mail ->
// klik -> zapis `potvrzen`. Cely Worker, Gmail i D1 podvrzene (krit. 1-3 a 8).
//   node web/scripts/test-hlidac.mjs
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import worker from '../worker.js';
import { casIso, overSouhlasToken, podpisSouhlas } from '../souhlas.js';

const KLIC = 'test-klic-souhlas';
const EMAIL = 'Jana.Test@Firma.cz';
const ADRESA = EMAIL.toLowerCase();
const DEN = 86400000;

const odeslane = [];
globalThis.fetch = async (url, init) => {
  if (String(url).includes('oauth2')) return new Response(JSON.stringify({ access_token: 't' }));
  const raw = JSON.parse(init.body).raw.replace(/-/g, '+').replace(/_/g, '/');
  const text = new TextDecoder().decode(Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)));
  const [hlavicky, ...zbytek] = text.split('\r\n\r\n');
  const telo = zbytek.join('\r\n\r\n');
  odeslane.push({
    to: /^To: (.*)$/m.exec(hlavicky)?.[1],
    telo: /base64/i.test(hlavicky)
      ? new TextDecoder().decode(Uint8Array.from(atob(telo.replace(/\s+/g, '')), (c) => c.charCodeAt(0)))
      : telo,
  });
  return new Response('{}');
};

const radky = [];
const db = {
  prepare: (sql) => ({ bind: (...a) => ({ run: async () => { radky.push({ sql, a }); return {}; } }) }),
};
const env = {
  GMAIL_CLIENT_ID: 'x', GMAIL_CLIENT_SECRET: 'x', GMAIL_REFRESH_TOKEN: 'x',
  MANTA_SOUHLAS_KLIC: KLIC, DB: db,
  ASSETS: { fetch: async () => new Response('nenalezeno', { status: 404 }) },
};

const ipky = [];
const req = (cesta, init = {}, ip = String(Math.random())) => {
  ipky.push(ip);
  return new Request(`https://mantait.cz${cesta}`, {
    ...init, headers: { 'cf-connecting-ip': ip, ...(init.headers || {}) },
  });
};
const formular = (pole = {}) => new URLSearchParams({
  email: EMAIL, region: 'Vysočina', obor: 'strojírenství', souhlas: 'ano', kontrolni_udaj: '', ...pole,
});
const post = (pole, init = {}, ip) => worker.fetch(req('/api/hlidac', { method: 'POST', body: formular(pole), ...init }, ip), env, null);
// sloupce: adresa, udalost, zdroj, cas, zneni, region, obor, ip
const sloupec = (r) => ({ adresa: r.a[0], udalost: r.a[1], zdroj: r.a[2], cas: r.a[3], zneni: r.a[4] });

const logy = [];
const puvodniLog = console.log;
const puvodniError = console.error;
console.log = (...a) => logy.push(a.join(' '));
console.error = (...a) => logy.push(a.join(' '));
try {
  // unit: roundtrip a tvar tokenu
  const cas0 = casIso(Date.UTC(2026, 8, 26, 12, 0, 0));
  assert.equal(cas0, '2026-09-26T12:00:00+00:00', 'cas ve tvaru Python isoformat(timespec=seconds)');
  const t0 = await podpisSouhlas('x@y.cz', cas0, 'potvrdit', KLIC);
  assert.match(t0, /^[A-Za-z0-9_-]+\.[0-9a-f]{64}$/);
  assert.deepEqual(await overSouhlasToken(t0, 'potvrdit', KLIC, Date.parse(cas0)), { adresa: 'x@y.cz', cas: cas0 });
  await assert.rejects(() => podpisSouhlas('x@y.cz', cas0, 'jiny', KLIC));
  assert.equal(await overSouhlasToken('neni.token', 'potvrdit', KLIC, Date.now()), null);
  assert.equal(await overSouhlasToken('!!!.' + 'a'.repeat(64), 'potvrdit', KLIC, Date.now()), null);
  assert.equal(await overSouhlasToken(t0, 'potvrdit', '', Date.now()), null);
  assert.equal(await overSouhlasToken('x'.repeat(1025), 'potvrdit', KLIC, Date.now()), null);

  // krit. 1: platny POST -> 303, 1 radek zapsan, prave 1 mail s odkazem
  let res = await post();
  assert.equal(res.status, 303);
  assert.ok(res.headers.get('Location').endsWith('/hlidac-vyzev/zkontrolujte-postu'));
  assert.equal(radky.length, 1);
  assert.match(radky[0].sql, /^INSERT INTO souhlas_udalosti \(adresa, udalost, zdroj, cas, zneni, region, obor, ip\)/);
  assert.deepEqual({ ...sloupec(radky[0]), cas: undefined },
    { adresa: ADRESA, udalost: 'zapsan', zdroj: 'web-hlidac', cas: undefined, zneni: 'ZNENI_V0' });
  assert.match(radky[0].a[3], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/);
  assert.equal(odeslane.length, 1, 'prave 1 mail');
  assert.equal(odeslane[0].to, ADRESA);
  assert.ok(odeslane[0].telo.includes('https://mantait.cz/api/souhlas/potvrd?t='));
  assert.ok(!/\+420|tel:/.test(odeslane[0].telo), 'bez telefonu');
  const token = decodeURIComponent(/\/api\/souhlas\/potvrd\?t=(\S+)/.exec(odeslane[0].telo)[1]);

  // krit. 2: bez souhlasu, neplatny e-mail, honeypot -> 0 radku, 0 mailu
  for (const [co, pole, status] of [
    ['bez souhlasu', { souhlas: '' }, 400],
    ['neplatny e-mail', { email: 'neni-mail' }, 400],
    ['bez regionu', { region: ' ' }, 400],
    ['honeypot', { kontrolni_udaj: 'bot' }, 303],
    ['honeypot website', { website: 'bot' }, 303],
  ]) {
    res = await post(pole);
    assert.equal(res.status, status, co);
    assert.equal(radky.length, 1, `${co}: 0 novych radku`);
    assert.equal(odeslane.length, 1, `${co}: 0 mailu`);
  }
  res = await post({}, { headers: { origin: 'https://cizi.cz' } });
  assert.equal(res.status, 403, 'cizi Origin');
  const ip = `brzda-${Math.random()}`;
  for (let i = 0; i < 5; i++) await post({ souhlas: '' }, {}, ip);
  res = await post({}, {}, ip);
  assert.equal(res.status, 429, '6. POST z jedne IP');
  assert.ok((await res.text()).includes('href="/hlidac-vyzev"'));
  assert.equal(radky.length, 1);
  assert.ok(logy.some((l) => l.includes('"event":"hlidac.rate_limited"')));

  // krit. 3: klik na odkaz z mailu -> 303 potvrzeno + radek potvrzen
  res = await worker.fetch(req(`/api/souhlas/potvrd?t=${encodeURIComponent(token)}`), env, null);
  assert.equal(res.status, 303);
  assert.ok(res.headers.get('Location').endsWith('/hlidac-vyzev/potvrzeno'));
  assert.equal(radky.length, 2);
  assert.deepEqual({ ...sloupec(radky[1]), cas: undefined },
    { adresa: ADRESA, udalost: 'potvrzen', zdroj: 'odkaz', cas: undefined, zneni: null });
  assert.equal(odeslane.length, 1, 'potvrzeni neposila mail');

  const ted = Date.now();
  const posledni = token.at(-1) === 'a' ? 'b' : 'a';
  const neplatne = [
    ['zmeneny podpis', token.slice(0, -1) + posledni],
    ['ucel odhlasit', await podpisSouhlas(ADRESA, casIso(ted), 'odhlasit', KLIC)],
    ['cizi klic', await podpisSouhlas(ADRESA, casIso(ted), 'potvrdit', 'cizi-klic')],
    ['31 dni zpet', await podpisSouhlas(ADRESA, casIso(ted - 31 * DEN), 'potvrdit', KLIC)],
    ['necitelny cas', await podpisSouhlas(ADRESA, 'vcera', 'potvrdit', KLIC)],
    ['bez t', ''],
  ];
  for (const [co, t] of neplatne) {
    res = await worker.fetch(req(`/api/souhlas/potvrd?t=${encodeURIComponent(t)}`), env, null);
    assert.equal(res.status, 403, co);
    assert.ok((await res.text()).includes('Odkaz neplatí'), co);
    assert.equal(res.headers.get('Cache-Control'), 'private, no-store', co);
    assert.equal(res.headers.get('X-Robots-Tag'), 'noindex', co);
    assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer', co);
    assert.equal(radky.length, 2, `${co}: 0 novych radku`);
  }
  const t29 = await podpisSouhlas(ADRESA, casIso(ted - 29 * DEN), 'potvrdit', KLIC);
  res = await worker.fetch(req(`/api/souhlas/potvrd?t=${encodeURIComponent(t29)}`), env, null);
  assert.equal(res.status, 303, '29 dni zpet plati');
  assert.equal(radky.length, 3);
  res = await worker.fetch(req(`/api/souhlas/potvrd?t=${encodeURIComponent(t29)}`, { method: 'POST' }), env, null);
  assert.equal(res.status, 405);

  // krit. 8: bez DB nebo bez klice -> 503, nic nezapsano ani odeslano
  for (const [co, e] of [['bez DB', { ...env, DB: undefined }], ['bez klice', { ...env, MANTA_SOUHLAS_KLIC: undefined }]]) {
    res = await worker.fetch(req('/api/hlidac', { method: 'POST', body: formular() }), e, null);
    assert.equal(res.status, 503, co);
    res = await worker.fetch(req(`/api/souhlas/potvrd?t=${encodeURIComponent(t29)}`), e, null);
    assert.equal(res.status, 503, `${co} potvrd`);
    assert.equal(radky.length, 3, `${co}: 0 radku`);
    assert.equal(odeslane.length, 1, `${co}: 0 mailu`);
  }
  assert.ok(logy.some((l) => l.includes('"event":"hlidac.zapsan"')));
  assert.ok(logy.some((l) => l.includes('"event":"hlidac.potvrzen"')));
  for (const l of logy) {
    assert.ok(!l.toLowerCase().includes(ADRESA), `log bez e-mailu: ${l}`);
    assert.ok(!l.includes(token), 'log bez tokenu');
    assert.ok(!l.includes('Vysočina'), 'log bez regionu');
    for (const i of ipky) assert.ok(!l.includes(i), `log bez IP: ${l}`);
  }

  // staticky: stavove stranky maji noindex, stranka hlidace (rez 5) je v indexu
  for (const s of ['hlidac-vyzev/zkontrolujte-postu.html', 'hlidac-vyzev/potvrzeno.html', 'hlidac-vyzev/odhlaseno.html']) {
    const u = new URL(`../${s}`, import.meta.url);
    assert.ok(existsSync(u), s);
    assert.ok(readFileSync(u, 'utf8').includes('<meta name="robots" content="noindex">'), `${s} noindex`);
  }
  const html = readFileSync(new URL('../hlidac-vyzev.html', import.meta.url), 'utf8');
  assert.ok(!/name="robots"/.test(html) && !html.includes('ZNENI_V0'), 'hlidac-vyzev.html bez noindex a placeholderu');
  assert.ok(html.includes('<link rel="canonical" href="https://mantait.cz/hlidac-vyzev">'), 'canonical');
  assert.ok(readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8').includes('<loc>https://mantait.cz/hlidac-vyzev</loc>'), 'sitemap');
  assert.ok(readFileSync(new URL('../dotace-mas.html', import.meta.url), 'utf8').includes('href="/hlidac-vyzev"'), 'odkaz z dotace-mas');
  assert.match(html, /<form method="post" action="\/api\/hlidac">/);
  assert.ok(/name="souhlas" type="checkbox" value="ano"/.test(html) && !/checked/.test(html), 'souhlas nezaskrtnuty');

  // krit. 5 (T0926-212): sdileny literalni vektor -- tentyz retezec assertuje souhlasy.py _test()
  const VEKTOR = 'eEB5LmN6fDIwMjYtMDEtMDFUMDA6MDA6MDArMDA6MDB8b2RobGFzaXQ'
    + '.f461b809da9e0e6486c04a5056dfadf1dee24520e87dd4281e4fca324bc4a3fa';
  const KLIC_V = 'testovaci-klic';
  assert.equal(await podpisSouhlas('x@y.cz', '2026-01-01T00:00:00+00:00', 'odhlasit', KLIC_V), VEKTOR);
  assert.deepEqual(await overSouhlasToken(VEKTOR, 'odhlasit', KLIC_V, Date.parse('2027-01-01T00:00:00Z')),
    { adresa: 'x@y.cz', cas: '2026-01-01T00:00:00+00:00' }, 'odhlaseni neexpiruje');

  // krit. 4: odhlaseni jednim klikem -> 303 odhlaseno, 1 udalost odvolan, 0 mailu
  const envV = { ...env, MANTA_SOUHLAS_KLIC: KLIC_V };
  const odhlas = (t, e = envV, init = {}) => worker.fetch(req(`/api/souhlas/odhlas${t === undefined ? '' : `?t=${encodeURIComponent(t)}`}`, init), e, null);
  let pred = radky.length;
  const predMaily = odeslane.length;
  logy.length = 0;
  res = await odhlas(VEKTOR);
  assert.equal(res.status, 303);
  assert.ok(res.headers.get('Location').endsWith('/hlidac-vyzev/odhlaseno'));
  assert.equal(radky.length, pred + 1);
  assert.deepEqual({ ...sloupec(radky.at(-1)), cas: undefined },
    { adresa: 'x@y.cz', udalost: 'odvolan', zdroj: 'odkaz', cas: undefined, zneni: null });
  assert.ok(logy.some((l) => l.includes('"event":"souhlas.odhlasen"')));
  pred = radky.length;
  const posledniV = VEKTOR.at(-1) === 'a' ? 'b' : 'a';
  for (const [co, t] of [
    ['ucel potvrdit', await podpisSouhlas('x@y.cz', casIso(Date.now()), 'potvrdit', KLIC_V)],
    ['podvrzeny', VEKTOR.slice(0, -1) + posledniV],
    ['bez t', undefined],
  ]) {
    res = await odhlas(t);
    assert.equal(res.status, 403, co);
    assert.ok((await res.text()).includes('Odkaz neplatí'), co);
    assert.equal(radky.length, pred, `${co}: 0 zapisu`);
  }
  for (const [co, e] of [['bez DB', { ...envV, DB: undefined }], ['bez klice', { ...envV, MANTA_SOUHLAS_KLIC: undefined }]]) {
    res = await odhlas(VEKTOR, e);
    assert.equal(res.status, 503, co);
    assert.equal(radky.length, pred, `${co}: 0 zapisu`);
  }
  res = await odhlas(VEKTOR, envV, { method: 'POST' });
  assert.equal(res.status, 405);
  assert.equal(radky.length, pred);
  assert.equal(odeslane.length, predMaily, 'odhlaseni neposila mail');
  for (const l of logy) assert.ok(!l.includes('x@y.cz'), `log odhlaseni bez e-mailu: ${l}`);
  assert.ok(existsSync(new URL('../hlidac-vyzev/odhlaseno.html', import.meta.url)));
  assert.ok(readFileSync(new URL('../hlidac-vyzev/odhlaseno.html', import.meta.url), 'utf8')
    .includes('<meta name="robots" content="noindex">'), 'odhlaseno noindex');

  // krit. 6 (T0926-213): checkbox hlidace v dotazniku dotace-mas
  const dotaznik = (pole, e = env) => worker.fetch(req('/api/dotaznik', {
    method: 'POST', headers: { origin: 'https://mantait.cz' },
    body: new URLSearchParams({ email: 'a@b.cz', text: 'dotaz', mas: 'jesenicko', ...pole }),
  }), e, null);
  const udalostiDotazniku = () => radky.filter((r) => r.a[2] === 'dotaznik');
  const potvrzovaci = () => odeslane.filter((m) => m.telo.includes('/api/souhlas/potvrd?t='));
  logy.length = 0;

  // a. hlidac=ano -> /dekujeme, 1 zapsan (dotaznik, jesenicko), 1 potvrzovaci mail na a@b.cz
  let predM = odeslane.length;
  const predP = potvrzovaci().length;
  res = await dotaznik({ hlidac: 'ano' });
  assert.equal(res.status, 303);
  assert.ok(res.headers.get('Location').endsWith('/dekujeme'));
  assert.equal(udalostiDotazniku().length, 1);
  const u = udalostiDotazniku()[0];
  assert.deepEqual([u.a[0], u.a[1], u.a[2], u.a[5]], ['a@b.cz', 'zapsan', 'dotaznik', 'jesenicko']);
  assert.equal(potvrzovaci().length, predP + 1);
  assert.equal(potvrzovaci().at(-1).to, 'a@b.cz');
  const mailuSHlidacem = odeslane.length - predM;

  // b. bez hlidac -> /dekujeme, 0 udalosti, o 1 mail mene (jen notifikace + potvrzeni klientovi)
  predM = odeslane.length;
  res = await dotaznik({});
  assert.equal(res.status, 303);
  assert.ok(res.headers.get('Location').endsWith('/dekujeme'));
  assert.equal(udalostiDotazniku().length, 1, 'bez hlidac: 0 udalosti');
  assert.equal(potvrzovaci().length, predP + 1, 'bez hlidac: zadny potvrzovaci mail');
  assert.equal(odeslane.length - predM, mailuSHlidacem - 1);
  assert.equal(odeslane.length - predM, 2, 'notifikace + potvrzeni klientovi');

  // c. bez env.DB -> dotaznik stale /dekujeme, 0 udalosti, log hlidac.selhal
  res = await dotaznik({ hlidac: 'ano' }, { ...env, DB: undefined });
  assert.equal(res.status, 303);
  assert.ok(res.headers.get('Location').endsWith('/dekujeme'));
  assert.equal(udalostiDotazniku().length, 1);
  assert.ok(logy.some((l) => l.includes('"event":"hlidac.selhal"')));

  // d. DB.prepare hodi vyjimku -> dotaznik stale /dekujeme
  const padajiciDb = { prepare: () => { throw new Error('D1 down a@b.cz'); } };
  res = await dotaznik({ hlidac: 'ano' }, { ...env, DB: padajiciDb });
  assert.equal(res.status, 303);
  assert.ok(res.headers.get('Location').endsWith('/dekujeme'));

  // e. jen telefon, bez e-mailu -> 0 udalosti
  res = await dotaznik({ hlidac: 'ano', email: '', telefon: '777000111' });
  assert.equal(res.status, 303);
  assert.equal(udalostiDotazniku().length, 1);
  for (const l of logy) assert.ok(!l.includes('a@b.cz'), `log dotazniku bez e-mailu: ${l}`);

  // f. staticky: checkbox hlidac v #dotaznik, nepovinny a nezaskrtnuty
  const dm = readFileSync(new URL('../dotace-mas.html', import.meta.url), 'utf8');
  const form = /<form[^>]*id="dotaznik"[\s\S]*?<\/form>/.exec(dm)?.[0];
  assert.ok(form, '#dotaznik existuje');
  const input = /<input[^>]*name="hlidac"[^>]*>/.exec(form)?.[0];
  assert.ok(input, 'checkbox hlidac v #dotaznik');
  assert.ok(/type="checkbox"/.test(input) && /value="ano"/.test(input), input);
  assert.ok(!/\bchecked\b/.test(input) && !/\brequired\b/.test(input), 'bez checked a required');
} finally {
  console.log = puvodniLog;
  console.error = puvodniError;
}
console.log('test-hlidac: OK');
