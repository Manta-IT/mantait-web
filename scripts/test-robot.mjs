// T0923-92: robot z kontaktniho formulare nesmi skoncit ve fronte (triaz -> task),
// skutecna poptavka ano. Pousti cely Worker, Gmail API je podvrzene.
//   node web/scripts/test-robot.mjs
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

async function posli(pole) {
  odeslane.length = 0;
  const res = await worker.fetch(new Request('https://mantait.cz/api/kontakt', {
    method: 'POST', body: new URLSearchParams({ cesta: 'zprava', kontrolni_udaj: '', ...pole }),
    headers: { 'cf-connecting-ip': String(Math.random()) },
  }), env, null);
  assert.equal(res.status, 303, 'robot i clovek konci na dekujeme (robot nesmi poznat, ze byl odhalen)');
  return [...odeslane];
}

// Presne tvary z Gmailu 20.-23. 9. (1a0cbd0896a59eee, 1a0c663f879fcf91,
// 1a0c63fe3dd3e2ed, 1a0c4ffebd447818, 1a0c054621779505).
const roboti = [
  { jmeno: 'Martinez', email: 'aishakhn13@gmail.com', zprava: 'Mám zájem o další informace. Kontaktujte mě prosím e-mailem — manta it.' },
  { jmeno: 'Thompson', email: 'rajdeep20@hotmail.com', zprava: 'Mám zájem o další informace. Kontaktujte mě prosím e-mailem — manta it.' },
  { jmeno: 'Jackson', email: 'nourharidy07@gmail.com', zprava: "Hi there! I'd like to hear more about email updates. Please confirm my subscription. Thanks in advance." },
  { jmeno: 'Garcia', email: 'be.currie04@gmail.com', zprava: 'Hello! Please add me for news about company news. I am happy to receive emails. Thank you. Please send me news and updates by email.' },
];
for (const r of roboti) {
  const m = await posli(r);
  assert.equal(m.length, 1, `robot ${r.jmeno}: jen notifikace Petrovi, zadne potvrzeni obeti`);
  assert.equal(m[0].to, 'petr.kokoska@mantait.cz');
  assert.equal(m[0].replyTo, undefined, 'bez Reply-To ho stav_kampane nepozna jako formular -> zadny triaz ani task');
  assert.match(m[0].predmet, /^Robot z kontaktního formuláře/);
}
console.log(`roboti: ${roboti.length}/${roboti.length} bez Reply-To a bez potvrzeni OK`);

const lide = [
  { jmeno: 'Jan Novák', firma: 'Novák s.r.o.', email: 'jan@novak.cz', zprava: 'Dosluhuje nám skladový systém, co s tím?' },
  { jmeno: 'Eva', email: 'eva@gmail.com', zprava: 'Mám zájem o další informace k dotaci, kontaktujte mě prosím e-mailem.' },
  // i kdyz text zni jako robot, telefon ukazuje na cloveka
  { jmeno: 'Petr', telefon: '777 123 456', email: 'p@x.cz', zprava: 'Please confirm my subscription to your newsletter.' },
  { cesta: 'zavolat', jmeno: 'Karel', telefon: '777 000 111' },
];
for (const c of lide) {
  const m = await posli(c);
  assert.equal(m[0].predmet, 'Zpráva z kontaktního formuláře', `clovek ${c.jmeno}: bezny predmet`);
  if (c.email) {
    assert.equal(m[0].replyTo, c.email, 'Reply-To = zakaznik -> stav_kampane ho zaradi do fronty');
    assert.equal(m.length, 2, 'clovek dostane potvrzeni');
    assert.equal(m[1].to, c.email);
  } else {
    assert.equal(m.length, 1);
  }
}
console.log(`skutecne poptavky: ${lide.length}/${lide.length} projdou beze zmeny OK`);

// ostatni formulare filtr neresi (dotaznik je nejteplejsi lead kampane)
const res = await worker.fetch(new Request('https://mantait.cz/api/dotaznik', {
  method: 'POST', headers: { 'cf-connecting-ip': 'd' },
  body: new URLSearchParams({ email: 'a@b.cz', zamer: 'newsletter subscription' }),
}), env, null);
assert.equal(res.status, 303);
assert.equal(odeslane.at(-2).predmet, 'Dotace MAS: ověření způsobilosti');
console.log('dotaznik filtr neresi OK');
