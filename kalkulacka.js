/* Kalkulacka dopadu AI na byznys -- /kalkulacka
   Model je zamerne jednoduchy a cely viditelny: ctyri vstupy, jedno nasobeni
   a jedno deleni. Slozitejsi vzorec by vypadal presneji, ale presnejsi by
   nebyl -- vstupy jsou odhad cloveka, ktery stranku otevrel.

   Vypocetni cast je oddelena od DOM, protoze ji overuje `scripts/test-kalkulacka.mjs`
   (node --test) bez prohlizece. Obsluha stranky se pripoji az dole, jen kdyz
   modul bezi v prohlizeci. */

/** 45 pracovnich tydnu v roce: 52 minus dovolena, svatky a nemoc. Model, ne udaj. */
export const TYDNU_V_ROCE = 45;

/** Cenik podnikove AI podle /reseni-podnikova-ai (zavedeni od 89 000 Kc,
    provoz od 8 000 Kc mesicne). Zmena ceny na strance = zmena i tady. */
export const ZAVEDENI = 89000;
export const PROVOZ_MESICNE = 8000;

function cislo(hodnota, nazev, min, max) {
  if (typeof hodnota !== 'number' || !Number.isFinite(hodnota)) {
    throw new RangeError(nazev + ': cekam cislo, dostal jsem ' + JSON.stringify(hodnota));
  }
  if (hodnota < min || hodnota > max) {
    throw new RangeError(nazev + ': ' + hodnota + ' je mimo rozsah ' + min + ' az ' + max);
  }
  return hodnota;
}

/**
 * Spocita rocni dopad jedne agendy prevzate strojem.
 *
 * @param {object} vstup
 * @param {number} vstup.lidi        kolik lidi tu agendu dela (1-500)
 * @param {number} vstup.hodinyTydne kolik hodin tydne na ni padne jednomu cloveku (0-40)
 * @param {number} vstup.sazba       hodinovy naklad zamestnavatele v Kc (100-5000)
 * @param {number} vstup.podil       podil prace, ktery prevezme stroj (0-1)
 * @param {number} [vstup.zavedeni]        jednorazove zavedeni v Kc
 * @param {number} [vstup.provozMesicne]   mesicni provoz v Kc
 * @returns {{hodinyRocne:number, usporaRocne:number, nakladPrvniRok:number,
 *            rozdilPrvniRok:number, rozdilDalsiRok:number, navratnostMesicu:number|null}}
 *          `navratnostMesicu` je null, kdyz mesicni uspora neprevysi mesicni provoz --
 *          takova agenda se nevrati nikdy a kalkulacka to ma rict nahlas.
 */
export function spocitej(vstup) {
  const lidi = cislo(vstup.lidi, 'lidi', 1, 500);
  const hodinyTydne = cislo(vstup.hodinyTydne, 'hodinyTydne', 0, 40);
  const sazba = cislo(vstup.sazba, 'sazba', 100, 5000);
  const podil = cislo(vstup.podil, 'podil', 0, 1);
  const zavedeni = cislo(vstup.zavedeni === undefined ? ZAVEDENI : vstup.zavedeni, 'zavedeni', 0, 1e7);
  const provozMesicne = cislo(
    vstup.provozMesicne === undefined ? PROVOZ_MESICNE : vstup.provozMesicne, 'provozMesicne', 0, 1e6);

  const hodinyRocne = lidi * hodinyTydne * TYDNU_V_ROCE * podil;
  const usporaRocne = hodinyRocne * sazba;
  const nakladPrvniRok = zavedeni + 12 * provozMesicne;
  const mesicniUspora = usporaRocne / 12;

  return {
    hodinyRocne,
    usporaRocne,
    nakladPrvniRok,
    rozdilPrvniRok: usporaRocne - nakladPrvniRok,
    rozdilDalsiRok: usporaRocne - 12 * provozMesicne,
    navratnostMesicu: mesicniUspora > provozMesicne ? zavedeni / (mesicniUspora - provozMesicne) : null,
  };
}

/* ---------------- obsluha stranky (jen v prohlizeci) ---------------- */

if (typeof document !== 'undefined') {
  const kc = new Intl.NumberFormat('cs-CZ', {maximumFractionDigits: 0});
  const poleId = ['lidi', 'hodinyTydne', 'sazba', 'podil'];
  const pole = {};
  for (const id of poleId) pole[id] = document.getElementById('vstup-' + id);

  if (poleId.every((id) => pole[id])) {
    const vystup = (id) => document.getElementById('vystup-' + id);
    const mesicu = (m) => (m < 1 ? 'do měsíce' : 'za ' + kc.format(Math.ceil(m)) + ' ' +
      (Math.ceil(m) === 1 ? 'měsíc' : Math.ceil(m) < 5 ? 'měsíce' : 'měsíců'));

    const prekresli = () => {
      const v = {
        lidi: Number(pole.lidi.value),
        hodinyTydne: Number(pole.hodinyTydne.value),
        sazba: Number(pole.sazba.value),
        podil: Number(pole.podil.value) / 100,
      };
      const r = spocitej(v);
      for (const id of poleId) {
        const echo = document.getElementById('echo-' + id);
        if (echo) echo.textContent = kc.format(Number(pole[id].value));
      }
      vystup('hodiny').textContent = kc.format(Math.round(r.hodinyRocne));
      vystup('uspora').textContent = kc.format(Math.round(r.usporaRocne));
      vystup('naklad').textContent = kc.format(r.nakladPrvniRok);
      vystup('rozdil').textContent = (r.rozdilPrvniRok >= 0 ? '+' : '') + kc.format(Math.round(r.rozdilPrvniRok));
      vystup('rozdil').classList.toggle('zaporne', r.rozdilPrvniRok < 0);
      vystup('navratnost').textContent = r.navratnostMesicu === null
        ? 'v tomhle rozsahu se to nevrátí'
        : 'vrátí se ' + mesicu(r.navratnostMesicu);
      vystup('navratnost').classList.toggle('zaporne', r.navratnostMesicu === null);
      vystup('dalsirok').textContent = (r.rozdilDalsiRok >= 0 ? '+' : '') + kc.format(Math.round(r.rozdilDalsiRok));
    };

    for (const id of poleId) pole[id].addEventListener('input', prekresli);
    prekresli();
  }
}
