// T0924-185: lead z /kalkulacka musi nest zdroj a utm_campaign az do mailu
// a presmerovani na /dekujeme?zdroj=... (konverze Ads). Gmail API je podvrzene.
//   node web/scripts/test-zdroj.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
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

const slug = 'nukib-hlasi-vyzvy-123';
r = await posli('kontakt', { ...zaklad, odkud: slug });
assert.match(r.notifikace, new RegExp(`^odkud: ${slug}$`, 'm'));
assert.ok(r.location.endsWith('/dekujeme'), r.location);
r = await posli('dotaznik', { email: 'a@b.cz', odkud: slug });
assert.match(r.notifikace, new RegExp(`^odkud: ${slug}$`, 'm'));
console.log('odkud platny: kontakt i dotaznik nesou radek v mailu OK');

for (const spatne of ['<script>', '/clanky/../x', 'a'.repeat(121)]) {
  r = await posli('kontakt', { ...zaklad, odkud: spatne });
  assert.doesNotMatch(r.notifikace, /^odkud:/m);
  r = await posli('dotaznik', { email: 'a@b.cz', odkud: spatne });
  assert.doesNotMatch(r.notifikace, /^odkud:/m);
}
console.log('odkud neplatny: tise zahozen, 303 OK');

r = await posli('kontakt', zaklad);
assert.doesNotMatch(r.notifikace, /^odkud:/m);
r = await posli('dotaznik', { email: 'a@b.cz' });
assert.doesNotMatch(r.notifikace, /^odkud:/m);
console.log('odkud chybejici: bez radku OK');

const kodOdkud = fs.readFileSync(new URL('../odkud.js', import.meta.url), 'utf8');
assert.ok(Buffer.byteLength(kodOdkud) < 1024, 'odkud.js >= 1 KB');
for (const zakazano of ['localStorage', 'sessionStorage', 'document.cookie']) {
  assert.ok(!kodOdkud.includes(zakazano), zakazano);
}
const ctx = { URL };
vm.runInNewContext(kodOdkud, ctx);
const O = 'https://mantait.cz';
assert.equal(ctx.slugZReferreru(`${O}/clanky/x-1`, O), 'x-1');
for (const ref of ['https://jinde.cz/clanky/x-1', `${O}/clanky/../x`, `${O}/clanky/seznamy/x`, `${O}/dotace-mas`, '']) {
  assert.equal(ctx.slugZReferreru(ref, O), '', ref);
}
console.log('odkud.js: slugZReferreru, velikost, bez uloziste OK');

function spustHandler(referrer) {
  const inputy = [{ value: '' }, { value: '' }];
  const selektory = [];
  let handler;
  const kontext = {
    URL,
    location: { origin: O },
    document: {
      referrer,
      addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') handler = fn; },
      querySelectorAll: (sel) => { selektory.push(sel); return sel === 'input[name="odkud"]' ? inputy : []; },
    },
  };
  vm.runInNewContext(kodOdkud, kontext);
  assert.equal(typeof handler, 'function', 'odkud.js neregistruje DOMContentLoaded');
  handler();
  return { inputy, selektory };
}

const platny = spustHandler(`${O}/clanky/x-1`);
assert.deepEqual(platny.inputy.map((i) => i.value), ['x-1', 'x-1']);
assert.ok(platny.selektory.includes('input[name="odkud"]'), platny.selektory.join());
for (const ref of ['https://jinde.cz/clanky/x-1', `${O}/dotace-mas`]) {
  assert.deepEqual(spustHandler(ref).inputy.map((i) => i.value), ['', ''], ref);
}
console.log('odkud.js: handler plni input[name="odkud"] OK');

for (const [soubor, id] of [['../dotace-mas.html', 'dotaznik'], ['../index.html', 'formular'], ['../kontakt.html', 'kontakt-form']]) {
  const html = fs.readFileSync(new URL(soubor, import.meta.url), 'utf8');
  const m = new RegExp(`<form[^>]*id="${id}"[^>]*>([\\s\\S]*?)</form>`).exec(html);
  assert.ok(m, `${soubor}: formular #${id} nenalezen`);
  assert.match(m[1], /<input type="hidden" name="odkud" value="">/, soubor);
  assert.match(html, /<script src="\/odkud\.js(\?v=[0-9a-f]+)?" defer><\/script>/, soubor);
}
console.log('odkud: input ve formularich a skript ve strankach OK');
