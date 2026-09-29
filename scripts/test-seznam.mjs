// T0929-226: formular kontrolniho seznamu (/api/seznam). Pousti cely Worker, Gmail API je podvrzene.
//   node web/scripts/test-seznam.mjs
import assert from 'node:assert/strict';
import worker from '../worker.js';

const odeslane = [];
globalThis.fetch = async (url, init) => {
  if (String(url).includes('oauth2')) return new Response(JSON.stringify({ access_token: 't' }));
  const raw = JSON.parse(init.body).raw.replace(/-/g, '+').replace(/_/g, '/');
  const text = new TextDecoder().decode(Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)));
  const hlavicky = text.split('\r\n\r\n')[0];
  const predmet = /^Subject: (.*)$/m.exec(hlavicky)[1];
  odeslane.push({
    to: /^To: (.*)$/m.exec(hlavicky)[1],
    replyTo: /^Reply-To: (.*)$/m.exec(hlavicky)?.[1],
    predmet: predmet.startsWith('=?UTF-8?B?')
      ? new TextDecoder().decode(Uint8Array.from(atob(predmet.slice(10, -2)), (c) => c.charCodeAt(0)))
      : predmet,
  });
  return new Response('{}');
};
const env = { GMAIL_CLIENT_ID: 'x', GMAIL_CLIENT_SECRET: 'x', GMAIL_REFRESH_TOKEN: 'x' };

let ip = 0;
async function posli(pole) {
  odeslane.length = 0;
  const res = await worker.fetch(new Request('https://mantait.cz/api/seznam', {
    method: 'POST', body: new URLSearchParams(pole),
    headers: { 'cf-connecting-ip': `seznam-${ip++}` },
  }), env, null);
  return { res, maily: [...odeslane], telo: res.status === 303 ? '' : await res.text() };
}

const SLUGY = [
  'vypadl-microsoft-365-a-firma-stala-co-ma-mit-majitel',
  'prisel-e-mail-o-zmene-bankovniho-uctu-dodavatele-kdo-to-ve',
  'kdyz-skonci-vas-dodavatel-skonci-s-nim-i-vase-data',
];
let ok = 0;

for (const slug of SLUGY) {
  const { res, maily } = await posli({ email: 'ctenar@firma.cz', zdroj_clanek: slug, kontrolni_udaj: '' });
  assert.equal(res.status, 303, slug);
  assert.ok(new URL(res.headers.get('location')).pathname === `/clanky/seznamy/${slug}`, `redirect ${slug}`);
  assert.equal(maily.length, 1, 'jen notifikace Petrovi, zadny reply na cizi adresu');
  assert.equal(maily[0].to, 'petr.kokoska@mantait.cz');
  assert.equal(maily[0].replyTo, 'ctenar@firma.cz');
  assert.equal(maily[0].predmet, `Seznam: ${slug}`);
  ok++;
}
console.log(`platne slugy: ${ok}/${SLUGY.length} OK`);

const spatne = ['neexistuje', 'constructor', '__proto__', '../x', 'a\r\nBcc: x@y.cz'];
for (const slug of spatne) {
  const { res, maily, telo } = await posli({ email: 'ctenar@firma.cz', zdroj_clanek: slug });
  assert.equal(res.status, 400, JSON.stringify(slug));
  assert.equal(maily.length, 0, `slug ${JSON.stringify(slug)} nesmi poslat mail`);
  assert.ok(telo.includes('href="/clanky/"'), 'zpet na /clanky/');
  ok++;
}
console.log(`slug mimo whitelist: ${spatne.length}/${spatne.length} 400 bez mailu OK`);

for (const email of ['', 'neplatny']) {
  const { res, maily, telo } = await posli({ email, zdroj_clanek: SLUGY[0] });
  assert.equal(res.status, 400, `email ${JSON.stringify(email)}`);
  assert.equal(maily.length, 0);
  assert.ok(telo.includes(`href="/clanky/${SLUGY[0]}"`), 'zpet na clanek');
  ok++;
}
console.log('chybny e-mail: 400 bez mailu, zpet na clanek OK');

const bot = await posli({ email: 'bot@x.cz', zdroj_clanek: SLUGY[0], kontrolni_udaj: 'http://spam' });
assert.equal(bot.res.status, 303);
assert.equal(new URL(bot.res.headers.get('location')).pathname, `/clanky/seznamy/${SLUGY[0]}`);
assert.equal(bot.maily.length, 0, 'honeypot: zadny mail');
ok++;
console.log('honeypot: 303 na stranku seznamu, 0 mailu OK');

console.log(`test-seznam: ${ok} skupin OK`);
