// T0924-471: tracer brany k prototypu Podnikove AI -- zadost (mail), osobni
// odkaz /p/<token> s vodoznakem, mereni do D1. Cely Worker, Gmail a D1 podvrzene.
//   node web/scripts/test-pristup.mjs
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import worker from '../worker.js';
import { overToken, podpisToken, vlozVodoznak } from '../pristup.js';

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
    to: /^To: (.*)$/m.exec(hlavicky)?.[1],
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
const env = {
  GMAIL_CLIENT_ID: 'x', GMAIL_CLIENT_SECRET: 'x', GMAIL_REFRESH_TOKEN: 'x',
  PRISTUP_KLIC: KLIC, PRISTUP_ZRUSENE: 'zrusene1', DB: db,
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

  // neplatne odkazy -> 403 bez prototypu
  const posledni = platny.at(-1) === 'A' ? 'B' : 'A';
  const neplatne = [
    ['zmeneny podpis', platny.slice(0, -1) + posledni, env],
    ['propadly', await podpisToken({ ...JAN, e: den(-1) }, KLIC), env],
    ['zruseny', await podpisToken({ ...JAN, z: 'zrusene1', e: den(14) }, KLIC), env],
    ['bez klice', platny, bezKlice],
  ];
  for (const [co, t, e] of neplatne) {
    res = await worker.fetch(req(`/p/${t}`), e, null);
    assert.equal(res.status, 403, co);
    assert.ok(!(await res.text()).includes('window.PRISTUP_T'), `${co}: bez prototypu`);
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

  // T0924-472 (rez 2): kriteria 1 a 12
  const zadost = (pole, ip = String(Math.random())) => worker.fetch(req('/api/pristup', {
    method: 'POST', body: new URLSearchParams(pole), headers: { 'cf-connecting-ip': ip },
  }), env, null);
  const TEXT = 'Tajny zamer 7731: AI nad objednavkami';

  // a) zadost -> 303 na dekujeme, prave 1 mail Petrovi s Reply-To zadatele
  odeslane.length = 0;
  res = await zadost({ email: 'jan@firma.cz', text: TEXT, kontrolni_udaj: '' });
  assert.equal(res.status, 303);
  assert.ok(res.headers.get('Location').endsWith('/podnikova-ai-dekujeme'));
  assert.equal(odeslane.length, 1, 'a) PRAVE 1 mail');
  assert.equal(odeslane[0].to, 'petr.kokoska@mantait.cz');
  assert.equal(odeslane[0].predmet, 'Pristup: podnikova-ai');
  assert.equal(odeslane[0].replyTo, 'jan@firma.cz');

  // b) honeypot -> 303, 0 mailu
  odeslane.length = 0;
  res = await zadost({ email: 'jan@firma.cz', text: TEXT, kontrolni_udaj: 'bot' });
  assert.equal(res.status, 303);
  assert.equal(odeslane.length, 0, 'b) honeypot bez mailu');

  // c) brzda: 6 zadosti ze stejne IP -> 5x 303, 6. = 429
  const ip = 'brzda-' + Math.random();
  for (let i = 0; i < 5; i++) {
    assert.equal((await zadost({ email: 'jan@firma.cz', text: TEXT }, ip)).status, 303, `c) zadost ${i + 1}`);
  }
  res = await zadost({ email: 'jan@firma.cz', text: TEXT }, ip);
  assert.equal(res.status, 429, 'c) 6. zadost');
  assert.ok((await res.text()).includes('/podnikova-ai/#pristup'), 'c) zpet na formular');

  // d) povinna pole -> 400, 0 mailu
  odeslane.length = 0;
  assert.equal((await zadost({ email: 'jan@firma.cz', text: '  ' })).status, 400, 'd) chybi text');
  assert.equal((await zadost({ text: TEXT })).status, 400, 'd) chybi email');
  assert.equal(odeslane.length, 0, 'd) bez mailu');
} finally {
  console.log = puvodniLog;
}

// logy: udalosti ano, osobni udaje ne
assert.ok(logy.some((l) => l.includes('"pristup.otevreno"')));
assert.ok(logy.some((l) => l.includes('"mereni.prijato"')));
for (const l of logy) {
  assert.ok(!l.includes('jan@firma.cz') && !l.includes('Jan Novák'), `log bez osobnich udaju: ${l}`);
}
// e) log zadosti: udalost ano, e-mail ani text ne
assert.ok(logy.some((l) => l.includes('"event":"pristup.zadost"')), 'e) pristup.zadost');
for (const l of logy) assert.ok(!l.includes('Tajny zamer 7731'), `e) log bez textu zadosti: ${l}`);

// f) formular na vysvetlovaci strance a podekovani
const prototyp = readFileSync(new URL('../../specs/podnikova-ai/prototyp/index.html', import.meta.url), 'utf8');
for (const s of ['action="/api/pristup"', 'name="email"', 'name="text"', 'name="kontrolni_udaj"']) {
  assert.ok(prototyp.includes(s), `f) index.html obsahuje ${s}`);
}
assert.ok(existsSync(new URL('../podnikova-ai-dekujeme.html', import.meta.url)), 'f) dekujeme stranka');

// staticke: portal neni verejny asset a odpovida zdroji
assert.match(readFileSync(new URL('../.assetsignore', import.meta.url), 'utf8'), /^_pristup\/$/m);
const portal = (await import('../_pristup/portal.js')).default;
assert.equal(portal, readFileSync(new URL('../../specs/podnikova-ai/prototyp/portal.html', import.meta.url), 'utf8'));

// spolecny vektor s pristup.py (T0924-476): jmeno s diakritikou hlida kodovani
const v = JSON.parse(readFileSync(new URL('../../tools/podnikova-ai-pristup/vektor_tokenu.json', import.meta.url), 'utf8'));
assert.equal(await podpisToken(v.payload, v.klic), v.token, 'JS token vektoru se musi shodovat s Pythonem');
assert.deepEqual(await overToken(v.token, v.klic, v.payload.d, new Set()), v.payload);
assert.equal(await overToken(v.token, v.klic, v.payload.d, new Set([v.payload.z])), null, 'zruseny odkaz');

console.log('test-pristup: OK');
