/* Test vypoctu kalkulacky dopadu AI (/kalkulacka).
   Spousti se z korene workspace: `node --test web/scripts/test-kalkulacka.mjs`
   Bez prohlizece a bez serveru -- testuje se cisty vypocet z `web/kalkulacka.js`. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {spocitej, TYDNU_V_ROCE, ZAVEDENI, PROVOZ_MESICNE} from '../kalkulacka.js';

const vychozi = {lidi: 3, hodinyTydne: 6, sazba: 420, podil: 0.4};

test('vychozi zadani: hodiny a koruny sedi na rucni vypocet', () => {
  const r = spocitej(vychozi);
  assert.equal(r.hodinyRocne, 3 * 6 * TYDNU_V_ROCE * 0.4);   // 324 hodin
  assert.equal(r.usporaRocne, 324 * 420);                     // 136 080 Kc
  assert.equal(r.nakladPrvniRok, ZAVEDENI + 12 * PROVOZ_MESICNE); // 185 000 Kc
  assert.equal(r.rozdilPrvniRok, 136080 - 185000);
  assert.equal(r.rozdilDalsiRok, 136080 - 96000);
});

test('navratnost se pocita az z prebytku nad mesicnim provozem', () => {
  // 136 080 / 12 = 11 340 Kc mesicne, minus provoz 8 000 = 3 340 Kc
  const r = spocitej(vychozi);
  assert.ok(Math.abs(r.navratnostMesicu - 89000 / 3340) < 1e-9);
});

test('mala agenda se nevrati: navratnost je null, ne zaporne cislo', () => {
  const r = spocitej({...vychozi, lidi: 1, hodinyTydne: 2, podil: 0.3});
  assert.equal(r.navratnostMesicu, null);
  assert.ok(r.rozdilPrvniRok < 0);
});

test('hranicni pripad: uspora presne na provoz se jeste nevraci', () => {
  // 8 000 Kc mesicne = 96 000 Kc rocne = 240 hodin po 400 Kc
  const r = spocitej({lidi: 1, hodinyTydne: 240 / TYDNU_V_ROCE, sazba: 400, podil: 1});
  assert.equal(r.usporaRocne, 96000);
  assert.equal(r.navratnostMesicu, null);
});

test('vetsi agenda se vraci driv (monotonie)', () => {
  const maly = spocitej(vychozi);
  const velky = spocitej({...vychozi, lidi: 6});
  assert.ok(velky.usporaRocne > maly.usporaRocne);
  assert.ok(velky.navratnostMesicu < maly.navratnostMesicu);
});

test('nulovy podil neusetri nic a naklad zustava', () => {
  const r = spocitej({...vychozi, podil: 0});
  assert.equal(r.usporaRocne, 0);
  assert.equal(r.rozdilPrvniRok, -(ZAVEDENI + 12 * PROVOZ_MESICNE));
  assert.equal(r.navratnostMesicu, null);
});

test('vlastni cenik prebije vychozi', () => {
  const r = spocitej({...vychozi, zavedeni: 0, provozMesicne: 0});
  assert.equal(r.nakladPrvniRok, 0);
  assert.equal(r.rozdilPrvniRok, r.usporaRocne);
  assert.ok(r.navratnostMesicu === 0);
});

test('nesmyslny vstup spadne, nepocita se dal', () => {
  assert.throws(() => spocitej({...vychozi, lidi: 0}), RangeError);
  assert.throws(() => spocitej({...vychozi, podil: 1.5}), RangeError);
  assert.throws(() => spocitej({...vychozi, sazba: 10}), RangeError);
  assert.throws(() => spocitej({...vychozi, hodinyTydne: NaN}), RangeError);
  assert.throws(() => spocitej({...vychozi, sazba: '420'}), RangeError);
});
