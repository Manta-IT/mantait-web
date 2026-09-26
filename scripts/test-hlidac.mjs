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

  // staticky: stub stranky existuji a maji noindex
  for (const s of ['hlidac-vyzev.html', 'hlidac-vyzev/zkontrolujte-postu.html', 'hlidac-vyzev/potvrzeno.html']) {
    const u = new URL(`../${s}`, import.meta.url);
    assert.ok(existsSync(u), s);
    assert.ok(readFileSync(u, 'utf8').includes('<meta name="robots" content="noindex">'), `${s} noindex`);
  }
  const html = readFileSync(new URL('../hlidac-vyzev.html', import.meta.url), 'utf8');
  assert.match(html, /<form method="post" action="\/api\/hlidac">/);
  assert.ok(/name="souhlas" type="checkbox" value="ano"/.test(html) && !/checked/.test(html), 'souhlas nezaskrtnuty');
} finally {
  console.log = puvodniLog;
  console.error = puvodniError;
}
console.log('test-hlidac: OK');
