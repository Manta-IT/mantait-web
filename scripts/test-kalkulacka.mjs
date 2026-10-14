/* Test vypoctu kalkulacky dopadu AI (/kalkulacka).
   Spousti se z korene workspace: `node --test web/scripts/test-kalkulacka.mjs`
   Bez prohlizece a bez serveru -- testuje se cisty vypocet z `web/kalkulacka.js`
   a shoda staticky vyplnenych cisel v `web/kalkulacka.html` s vychozimi posuvniky. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spocitej, TYDNU_V_ROCE, LET_NAVRATNOSTI} from '../kalkulacka.js';

const vychozi = {lidi: 3, hodinyTydne: 6, sazba: 420, podil: 0.4};

test('vychozi zadani: hodiny, koruny a strop sedi na rucni vypocet', () => {
  const r = spocitej(vychozi);
  assert.equal(r.hodinyRocne, 3 * 6 * TYDNU_V_ROCE * 0.4);   // 324 hodin
  assert.equal(r.usporaRocne, 324 * 420);                     // 136 080 Kc
  assert.equal(r.stropRozpoctu, 272160);                      // dva roky uspory
  assert.equal(LET_NAVRATNOSTI, 2);
});

test('vetsi agenda unese vyssi strop (monotonie)', () => {
  const maly = spocitej(vychozi);
  const velky = spocitej({...vychozi, lidi: 6});
  assert.ok(velky.stropRozpoctu > maly.stropRozpoctu);
});

test('nulovy podil: uspora i strop jsou nula', () => {
  const r = spocitej({...vychozi, podil: 0});
  assert.equal(r.usporaRocne, 0);
  assert.equal(r.stropRozpoctu, 0);
});

test('vysledek nenese zadnou cenu ani navratnost', () => {
  const r = spocitej(vychozi);
  for (const klic of ['navratnostMesicu', 'nakladPrvniRok', 'rozdilPrvniRok']) {
    assert.equal(klic in r, false, klic);
  }
});

test('nesmyslny vstup spadne, nepocita se dal', () => {
  assert.throws(() => spocitej({...vychozi, lidi: 0}), RangeError);
  assert.throws(() => spocitej({...vychozi, podil: 1.5}), RangeError);
  assert.throws(() => spocitej({...vychozi, sazba: 10}), RangeError);
  assert.throws(() => spocitej({...vychozi, hodinyTydne: NaN}), RangeError);
  assert.throws(() => spocitej({...vychozi, sazba: '420'}), RangeError);
});

test('HTML: zadna zrusena cena a staticka cisla sedi na vychozi posuvniky', () => {
  const html = readFileSync(new URL('../kalkulacka.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /89\s?000|8\s?000 Kč|vrátí se za/);
  const hodnota = (id) => Number(html.match(new RegExp('id="vstup-' + id + '"[^>]*value="([0-9]+)"'))[1]);
  const r = spocitej({
    lidi: hodnota('lidi'), hodinyTydne: hodnota('hodinyTydne'),
    sazba: hodnota('sazba'), podil: hodnota('podil') / 100,
  });
  const kc = new Intl.NumberFormat('cs-CZ', {maximumFractionDigits: 0});
  const bezMezer = (t) => t.replace(/\s/g, '');
  const staticke = (id) => bezMezer(html.match(new RegExp('id="vystup-' + id + '">([^<]*)<'))[1]);
  assert.equal(staticke('hodiny'), bezMezer(kc.format(Math.round(r.hodinyRocne))));
  assert.equal(staticke('uspora'), bezMezer(kc.format(Math.round(r.usporaRocne))));
  assert.equal(staticke('strop'), bezMezer(kc.format(Math.round(r.stropRozpoctu))));
});

test('JS: v kodu nezustala zrusena cena', () => {
  const js = readFileSync(new URL('../kalkulacka.js', import.meta.url), 'utf8');
  assert.doesNotMatch(js, /89000|PROVOZ_MESICNE/);
});
