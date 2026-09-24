// T0924-471: tracer brany k prototypu Podnikove AI -- zadost (mail), osobni
// odkaz /p/<token> s vodoznakem, mereni do D1. Cely Worker, Gmail a D1 podvrzene.
//   node web/scripts/test-pristup.mjs
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import worker from '../worker.js';
import { podpisToken, vlozVodoznak } from '../pristup.js';

const ZDROJ = new URL('../../specs/podnikova-ai/prototyp/portal.html', import.meta.url);
const PORTAL_ZDROJ = existsSync(ZDROJ) ? readFileSync(ZDROJ, 'utf8') : null;
const KLIC = 'test-klic-pristup';
const JAN = { z: '1a0test', j: 'Jan Novák', d: '2026-09-24', e: '2026-10-08' };
// Spolecny vektor s tools/podnikova-ai-pristup/test_pristup.py -- literal, NEPOCITAT z druhe implementace.
const VEKTOR = 'eyJ6IjoiMWEwdGVzdCIsImoiOiJKYW4gTm92w6FrIiwiZCI6IjIwMjYtMDktMjQiLCJlIjoiMjAyNi0xMC0wOCJ9.6jeUmD1sbaPlha3Kr02QRE3TWUW67e-cc6PTWjzacm0';

const odeslane = [];
globalThis.fetch = async (url, init) => {
  if (String(url).includes('oauth2')) return new Response(JSON.stringify({ access_token: 't' }));
  const raw = JSON.parse(init.body).raw.replace(/-/g, '+').replace(/_/g, '/');
  const text = new TextDecoder().decode(Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)));
  const [hlavicky, ...zbytek] = text.split('\r\n\r\n');
  const predmet = /^Subject: (.*)$/m.exec(hlavicky)[1];
  const telo = zbytek.join('\r\n\r\n');
  odeslane.push({
    replyTo: /^Reply-To: (.*)$/m.exec(hlavicky)?.[1],
    predmet: predmet.startsWith('=?UTF-8?B?')
      ? new TextDecoder().decode(Uint8Array.from(atob(predmet.slice(10, -2)), (c) => c.charCodeAt(0)))
      : predmet,
    telo: /base64/i.test(hlavicky)
      ? new TextDecoder().decode(Uint8Array.from(atob(telo.replace(/\s+/g, '')), (c) => c.charCodeAt(0)))
      : telo,
  });
  return new Response('{}');
};

const radky = [];
const db = {
  prepare: (sql) => ({ bind: (...a) => ({ sql, a }) }),
  batch: async (st) => { radky.push(...st); return []; },
};
const assetsVolano = [];
const env = {
  GMAIL_CLIENT_ID: 'x', GMAIL_CLIENT_SECRET: 'x', GMAIL_REFRESH_TOKEN: 'x',
  PRISTUP_KLIC: KLIC, PRISTUP_ZRUSENE: 'zrusene1', DB: db,
  ASSETS: { fetch: async (r) => { assetsVolano.push(new URL(r.url).pathname); return new Response('nenalezeno', { status: 404 }); } },
};
const bezKlice = { ...env, PRISTUP_KLIC: undefined };
const bezDb = { ...env, DB: undefined };

const req = (cesta, init = {}) => new Request(`https://mantait.cz${cesta}`, {
  ...init, headers: { 'cf-connecting-ip': String(Math.random()), ...(init.headers || {}) },
});
const den = (posun) => new Date(Date.now() + posun * 86400000).toISOString().slice(0, 10);

const logy = [];
const puvodniLog = console.log;
console.log = (...a) => logy.push(a.join(' '));
try {
  // kanonicky tvar tokenu
  assert.equal(await podpisToken(JAN, KLIC), VEKTOR, 'JS token se musi shodovat s Pythonem');

  // zadost o pristup: prave 1 mail, Reply-To zadatele, radek `text:` pro zadosti.py
  let res = await worker.fetch(req('/api/pristup', {
    method: 'POST', body: new URLSearchParams({ email: 'jan@firma.cz', text: 'Chceme AI na nabidky', kontrolni_udaj: '' }),
  }), env, null);
  assert.equal(res.status, 303);
  assert.equal(odeslane.length, 1, 'bez `reply` PRAVE 1 mail');
  assert.equal(odeslane[0].predmet, 'Pristup: podnikova-ai');
  assert.equal(odeslane[0].replyTo, 'jan@firma.cz');
  assert.match(odeslane[0].telo, /^text: Chceme AI na nabidky$/m);

  // platny odkaz (nezavisle na dnesnim datu)
  const platny = await podpisToken({ ...JAN, d: den(0), e: den(14) }, KLIC);
  res = await worker.fetch(req(`/p/${platny}`), env, null);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(html.includes(`Jan Novák · ${den(0)}`), 'vodoznak se jmenem a datem');
  assert.ok(html.includes('window.PRISTUP_T='));
  assert.equal(res.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(res.headers.get('X-Robots-Tag'), 'noindex');
  assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer');

  // krit. 5 (T0924-477): platnost 14 dni nese podepsane `e`, posledni den vcetne
  const hlavickyPristupu = (r, co) => {
    assert.equal(r.headers.get('Content-Type'), 'text/html; charset=utf-8', co);
    assert.match(r.headers.get('Cache-Control'), /private/, co);
    assert.match(r.headers.get('Cache-Control'), /no-store/, co);
    assert.equal(r.headers.get('X-Robots-Tag'), 'noindex', co);
    assert.equal(r.headers.get('Referrer-Policy'), 'no-referrer', co);
  };
  hlavickyPristupu(res, 'platny');
  const plati13 = await podpisToken({ ...JAN, d: den(0), e: den(13) }, KLIC);
  res = await worker.fetch(req(`/p/${plati13}`), env, null);
  assert.equal(res.status, 200, 'e = dnes+13');
  assert.ok((await res.text()).includes(`Jan Novák · ${den(0)}`));
  res = await worker.fetch(req(`/p/${await podpisToken({ ...JAN, e: den(0) }, KLIC)}`), env, null);
  assert.equal(res.status, 200, 'e = dnes je posledni platny den');

  // neplatne odkazy -> 403 bez prototypu
  const titulek = /<title>[^<]*<\/title>/.exec(PORTAL_ZDROJ ?? (await import('../_pristup/portal.js')).default)[0];
  const posledni = platny.at(-1) === 'A' ? 'B' : 'A';
  const neplatne = [
    ['zmeneny podpis', platny.slice(0, -1) + posledni, env],
    ['propadly', await podpisToken({ ...JAN, e: den(-1) }, KLIC), env],
    ['zruseny', await podpisToken({ ...JAN, z: 'zrusene1', e: den(14) }, KLIC), env],
    ['zruseny v seznamu', plati13, { ...env, PRISTUP_ZRUSENE: `jine, ${JAN.z}` }],
    ['bez klice', platny, bezKlice],
  ];
  for (const [co, t, e] of neplatne) {
    res = await worker.fetch(req(`/p/${t}`), e, null);
    assert.equal(res.status, 403, co);
    hlavickyPristupu(res, co);
    const telo = await res.text();
    assert.ok(!telo.includes('window.PRISTUP_T'), `${co}: bez prototypu`);
    assert.ok(!telo.includes(titulek), `${co}: bez ${titulek}`);
  }

  // krit. 6: portal neni dosazitelny jako asset -- jde do ASSETS (404), prototyp nevrati
  for (const cesta of ['/portal.html', '/_pristup/portal.js']) {
    res = await worker.fetch(req(cesta), env, null);
    assert.equal(assetsVolano.at(-1), cesta, `${cesta} jde do env.ASSETS`);
    assert.equal(res.status, 404, cesta);
    assert.ok(!(await res.text()).includes(titulek), `${cesta}: bez prototypu`);
  }

  // vodoznak escapuje jmeno
  const zly = vlozVodoznak('<html><body>x</body></html>', { j: '<script>x', d: '2026-09-24' }, 'a.b');
  assert.ok(!zly.includes('<script>x'));
  assert.ok(zly.includes('&lt;script&gt;x'));

  // mereni
  const mereni = (telo, e = env) => worker.fetch(req('/mereni', {
    method: 'POST', body: typeof telo === 'string' ? telo : JSON.stringify(telo),
  }), e, null);
  const u1 = [{ v: 'uvod', o: 'zam', ts: 1 }];
  res = await mereni({ t: platny, u: u1 });
  assert.equal(res.status, 204);
  assert.equal(radky.length, 1);
  assert.equal(radky[0].a[0], JAN.z, 'z se bere z tokenu, ne z tela');
  assert.equal((await mereni({ t: platny, u: Array(51).fill(u1[0]) })).status, 400);
  assert.equal((await mereni({ t: platny, u: [{ v: 'neexistuje', o: 'zam', ts: 1 }] })).status, 400);
  assert.equal((await mereni('{rozbity')).status, 400);
  const cizi = await podpisToken({ ...JAN, e: den(14) }, 'jiny-klic');
  assert.equal((await mereni({ t: cizi, u: u1 })).status, 403);
  assert.equal((await mereni({ t: platny, u: u1 }, bezDb)).status, 503);
  assert.equal(radky.length, 1, 'odmitnute davky nic nezapsaly');
} finally {
  console.log = puvodniLog;
}

// logy: udalosti ano, osobni udaje ne
assert.ok(logy.some((l) => l.includes('"pristup.otevreno"')));
assert.ok(logy.some((l) => l.includes('"mereni.prijato"')));
for (const l of logy) {
  assert.ok(!l.includes('jan@firma.cz') && !l.includes('Jan Novák'), `log bez osobnich udaju: ${l}`);
}

// staticke: portal neni verejny asset a odpovida zdroji
assert.match(readFileSync(new URL('../.assetsignore', import.meta.url), 'utf8'), /^_pristup\/$/m);
if (PORTAL_ZDROJ === null) {
  console.log('test-pristup: preskoceno portal.js == portal.html (chybi specs/, samostatny checkout webu)');
} else {
  assert.equal((await import('../_pristup/portal.js')).default, PORTAL_ZDROJ);
}

console.log('test-pristup: OK');
