// T0924-185: lead z /kalkulacka musi nest zdroj a utm_campaign az do mailu
// a presmerovani na /dekujeme?zdroj=... (konverze Ads). Gmail API je podvrzene.
//   node web/scripts/test-zdroj.mjs
import assert from 'node:assert/strict';
import worker from '../worker.js';

const dekoduj = (b) => new TextDecoder().decode(Uint8Array.from(atob(b), (c) => c.charCodeAt(0)));
const odeslane = [];
globalThis.fetch = async (url, init) => {
  if (String(url).includes('oauth2')) return new Response(JSON.stringify({ access_token: 't' }));
  const text = dekoduj(JSON.parse(init.body).raw.replace(/-/g, '+').replace(/_/g, '/'));
  const [hlavicky, telo] = text.split('\r\n\r\n');
  odeslane.push({ to: /^To: (.*)$/m.exec(hlavicky)[1], telo: dekoduj(telo.trim()) });
  return new Response('{}');
};
const env = { GMAIL_CLIENT_ID: 'x', GMAIL_CLIENT_SECRET: 'x', GMAIL_REFRESH_TOKEN: 'x' };

async function posli(formular, pole) {
  odeslane.length = 0;
  const res = await worker.fetch(new Request(`https://mantait.cz/api/${formular}`, {
    method: 'POST', body: new URLSearchParams(pole),
    headers: { 'cf-connecting-ip': String(Math.random()) },
  }), env, null);
  assert.equal(res.status, 303);
  return { location: res.headers.get('Location'), notifikace: odeslane[0].telo };
}

const zaklad = { cesta: 'zprava', kontrolni_udaj: '', jmeno: 'Jan', telefon: '777 123 456', zprava: 'Spocital jsem si to.' };

let r = await posli('kontakt', { ...zaklad, zdroj: 'kalkulacka', utm_campaign: 'ai-kalkulacka' });
assert.match(r.notifikace, /^zdroj: kalkulacka$/m);
assert.match(r.notifikace, /^utm_campaign: ai-kalkulacka$/m);
assert.ok(r.location.endsWith('/dekujeme?zdroj=kalkulacka'), r.location);
console.log('kontakt se zdrojem: pole v mailu + /dekujeme?zdroj=kalkulacka OK');

r = await posli('kontakt', zaklad);
assert.ok(r.location.endsWith('/dekujeme'), r.location);
assert.doesNotMatch(r.notifikace, /^zdroj:/m);
console.log('kontakt bez zdroje: /dekujeme beze zmeny OK');

r = await posli('kontakt', { ...zaklad, zdroj: '<script>' });
assert.ok(r.location.endsWith('/dekujeme'), r.location);
console.log('neplatny zdroj do URL neprojde OK');

r = await posli('dotaznik', { email: 'a@b.cz', zdroj: 'kalkulacka' });
assert.ok(r.location.endsWith('/dekujeme'), r.location);
assert.doesNotMatch(r.notifikace, /zdroj/);
console.log('dotaznik: zdroj ignorovan OK');
