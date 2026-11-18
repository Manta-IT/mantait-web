/* Kalkulacka dopadu AI na byznys -- /kalkulacka
   Model je zamerne jednoduchy a cely viditelny: ctyri vstupy, jen nasobeni. Slozitejsi vzorec by vypadal presneji, ale presnejsi by
   nebyl -- vstupy jsou odhad cloveka, ktery stranku otevrel.

   Vypocetni cast je oddelena od DOM, protoze ji overuje `scripts/test-kalkulacka.mjs`
   (node --test) bez prohlizece. Obsluha stranky se pripoji az dole, jen kdyz
   modul bezi v prohlizeci. */

/** 45 pracovnich tydnu v roce: 52 minus dovolena, svatky a nemoc. Model, ne udaj. */
export const TYDNU_V_ROCE = 45;

/** Dva roky jsou nase hranice navratnosti, ne pravidlo -- jako ukazka /podnikova-ai/ (T1014-44). */
export const LET_NAVRATNOSTI = 2;

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
 * Spocita rocni dopad jedne agendy prevzate strojem a strop rozpoctu na ni.
 *
 * @param {object} vstup
 * @param {number} vstup.lidi        kolik lidi tu agendu dela (1-500)
 * @param {number} vstup.hodinyTydne kolik hodin tydne na ni padne jednomu cloveku (0-40)
 * @param {number} vstup.sazba       hodinovy naklad zamestnavatele v Kc (100-5000)
 * @param {number} vstup.podil       podil prace, ktery prevezme stroj (0-1)
 * @returns {{hodinyRocne:number, usporaRocne:number, stropRozpoctu:number}}
 *          `stropRozpoctu` = uspora za LET_NAVRATNOSTI roky: tolik smi projekt
 *          na tu agendu stat, aby se vratil.
 */
export function spocitej(vstup) {
  const lidi = cislo(vstup.lidi, 'lidi', 1, 500);
  const hodinyTydne = cislo(vstup.hodinyTydne, 'hodinyTydne', 0, 40);
  const sazba = cislo(vstup.sazba, 'sazba', 100, 5000);
  const podil = cislo(vstup.podil, 'podil', 0, 1);

  const hodinyRocne = lidi * hodinyTydne * TYDNU_V_ROCE * podil;
  const usporaRocne = hodinyRocne * sazba;

  return {hodinyRocne, usporaRocne, stropRozpoctu: usporaRocne * LET_NAVRATNOSTI};
}

/**
 * Soucet nekolika agend jedne firmy pri spolecne hodinove sazbe (/ukazka-ai-planu).
 * @param {{lidi:number, hodinyTydne:number, podil:number}[]} agendy zapnute agendy
 * @param {number} sazba hodinovy naklad zamestnavatele v Kc
 */
export function spocitejPlan(agendy, sazba) {
  const soucet = {hodinyRocne: 0, usporaRocne: 0, stropRozpoctu: 0};
  for (const a of agendy) {
    const r = spocitej({...a, sazba});
    for (const k in soucet) soucet[k] += r[k];
  }
  return soucet;
}

/* ---------------- obsluha stranky (jen v prohlizeci) ---------------- */

if (typeof document !== 'undefined') {
  // Kampan Ads prichazi s utm_campaign; CTA ho predaji formulari na homepage,
  // aby lead nesl kampan (T0924-185). Jina hodnota nez kratky slug se zahodi.
  const kampan = new URLSearchParams(location.search).get('utm_campaign');
  if (kampan && /^[\w.-]{1,60}$/.test(kampan)) {
    for (const a of document.querySelectorAll('a[href^="/?zdroj=kalkulacka"]')) {
      a.href = a.getAttribute('href').replace('#napiste', '&utm_campaign=' + kampan + '#napiste');
    }
  }

  const kc = new Intl.NumberFormat('cs-CZ', {maximumFractionDigits: 0});
  const poleId = ['lidi', 'hodinyTydne', 'sazba', 'podil'];
  const pole = {};
  for (const id of poleId) pole[id] = document.getElementById('vstup-' + id);

  if (poleId.every((id) => pole[id])) {
    const vystup = (id) => document.getElementById('vystup-' + id);

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
      vystup('strop').textContent = kc.format(Math.round(r.stropRozpoctu));
    };

    for (const id of poleId) pole[id].addEventListener('input', prekresli);
    prekresli();
  }

  // Ukazka AI planu: zapinaci agendy + jedna sazba z modelove zaverky.
  const agendy = [...document.querySelectorAll('.prilezitost input[type=checkbox]')];
  const sazba = document.getElementById('vstup-sazba');
  if (agendy.length && sazba && !pole.lidi) {
    const prekresliPlan = () => {
      const zapnute = agendy.filter((a) => a.checked).map((a) => ({
        lidi: Number(a.dataset.lidi), hodinyTydne: Number(a.dataset.hodiny), podil: Number(a.dataset.podil),
      }));
      const r = spocitejPlan(zapnute, Number(sazba.value));
      document.getElementById('echo-sazba').textContent = kc.format(Number(sazba.value));
      document.getElementById('vystup-hodiny').textContent = kc.format(Math.round(r.hodinyRocne));
      document.getElementById('vystup-uspora').textContent = kc.format(Math.round(r.usporaRocne));
      document.getElementById('vystup-strop').textContent = kc.format(Math.round(r.stropRozpoctu));
    };
    for (const a of agendy) a.addEventListener('change', prekresliPlan);
    sazba.addEventListener('input', prekresliPlan);
    prekresliPlan();
  }
}
