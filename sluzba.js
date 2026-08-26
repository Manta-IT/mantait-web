/* =========================================================================
   Detail sluzby -- spolecne chovani vsech peti stranek druhe urovne.

   Zamerne jen dve veci. Obsah stranky na tenhle skript neceka: kdyz se
   nenacte, zustane cela stranka citelna i prodejna, jen nebude mit
   strukturovana data a navigace nedostane linku.
   ========================================================================= */

/* Strukturovana data pro FAQ. Vyhledavace i AI odpovedi ctou prave tohle --
   proto se generuji ze stejneho HTML, ktere vidi clovek. Kdyz nekdo upravi
   otazku na strance, schema se opravi samo a nemuze se s obsahem rozejit. */
(function faqSchema(){
  const polozky = [...document.querySelectorAll('.faq details')].map(d => ({
    "@type": "Question",
    "name": d.querySelector('summary').childNodes[0].textContent.trim(),
    "acceptedAnswer": {
      "@type": "Answer",
      "text": [...d.querySelectorAll('.odpoved p')].map(p => p.textContent.trim()).join(' ')
    }
  }));
  if (!polozky.length) return;
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify({
    "@context":"https://schema.org", "@type":"FAQPage", "mainEntity": polozky
  });
  document.head.appendChild(s);
})();

/* Hranice navigace az po odscrollovani hero. Zadny posluchac na scroll. */
(function nav(){
  const n = document.getElementById('nav');
  const hero = document.getElementById('hero');
  if (!n || !hero) return;
  new IntersectionObserver(([z]) => n.classList.toggle('posunuto', !z.isIntersecting),
    {rootMargin:'-72px 0px 0px 0px'}).observe(hero);
})();

/* Odkryti scen pri doscrollovani.

   POJISTKA: samotny IntersectionObserver nestaci. V uspane zalozce, pri
   prerenderu a na nekterych mobilnich prohlizecich se callback nespusti
   vubec -- a protoze zavreny stav uz je nasazeny, clovek by koukal na
   prazdna kolecka. Proto tvrdy casovac: kdyz observer do peti sekund
   nepromluvi, scena se odkryje tak jako tak.

   Prislo to z testovani: v neaktivni zalozce zustala cela casova osa prazdna,
   zatimco komentar u toho tvrdil, ze bez skriptu nechybi nic. Nechybi nic,
   kdyz se skript NENACTE. Kdyz se nacte a observer mlci, chybi vsechno. */
function odkryj(prvek, prah){
  if (!prvek) return;
  if (!('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  prvek.classList.add('pripravena');
  let hotovo = false;
  const spust = () => {
    if (hotovo) return;
    hotovo = true;
    prvek.classList.remove('pripravena');
  };

  const o = new IntersectionObserver(([z]) => {
    if (!z.isIntersecting) return;
    spust();
    o.disconnect();
  }, {threshold: prah});
  o.observe(prvek);

  setTimeout(spust, 5000);
}

/* Casova osa: nejdriv se nakresli cara shora dolu, pak piktogramy tahem po
   sobe. Osa je na vsech peti detailech, takze tohle je jedina uprava, ktera
   ozivi celou druhou uroven webu. */
odkryj(document.querySelector('.osa'), .2);

/* Desky s rannim hlasenim: otevrou se a papir prijede k divakovi. Neni to
   scrubovane -- pri rychlem scrollu by se papir nikdy neotevrel. */
odkryj(document.querySelector('.scena'), .35);

/* Mikro-diagramy u cisel. Nabihaji po sobe, protoze ukazuji pocet -- sedm
   carek se ma naskladat, ne objevit najednou. Samotna cisla se nehybou:
   dorustajici cislo je efekt, ne dukaz. */
odkryj(document.querySelector('.vysledky'), .25);

/* Rozpad nakladu (penize i cas): pruhy dorostou do sve sirky. Tady ma pohyb
   duvod -- ukazuje pomer mezi polozkami, ktery je vlastnim sdelenim toho
   obrazku. Neni to dorustajici cislo, je to dorustajici mnozstvi. */
document.querySelectorAll('.naklady').forEach(n => odkryj(n, .3));

/* Statistika uz nic nedorusta -- sto ctverecku je proste videt a reaguje na
   najeti. Dorustajici cislo je efekt, ne dukaz, a nic nesdeluje navic proti
   cislu, ktere tam proste stoji. */

/* Stopa jednoho udaje (Mapa firmy). Jedine misto na webu, kde navstevnik neco
   PREPNE misto aby koukal -- chybejici interakce byla nalez z kritiky.

   POJISTKA jako u scen: bez skriptu jsou v HTML videt vsechny tri stopy pod
   sebou i s nadpisy, takze stranka nic neztrati. Prepinac je v HTML skryty
   a odkryva ho az tenhle kod. Tlacitko, ktere bez skriptu nic nedela, je horsi
   nez zadne tlacitko. */
(function stopaUdaje(){
  const prepinac = document.getElementById('stopa-prepinac');
  const stopy = [...document.querySelectorAll('.stopa[data-stopa]')];
  if (!prepinac || stopy.length < 2) return;

  const tlacitka = [...prepinac.querySelectorAll('button[data-stopa]')];
  prepinac.hidden = false;
  stopy.forEach(s => s.querySelector('.stopa-nazev')?.remove());

  function vyber(klic){
    stopy.forEach(s => { s.hidden = s.dataset.stopa !== klic; });
    tlacitka.forEach(b => b.setAttribute('aria-selected', String(b.dataset.stopa === klic)));
  }

  tlacitka.forEach(b => b.addEventListener('click', () => vyber(b.dataset.stopa)));
  vyber(tlacitka[0].dataset.stopa);
})();

/* Stanice stopy nabihaji po sobe: smer zleva doprava je vlastnim sdelenim
   obrazku (udaj po ceste putuje), takze pohyb ma duvod. */
odkryj(document.getElementById('stopa-sekce'), .25);

/* Self-check zakona o kyberbezpecnosti: secte vlastni odpovedi navstevnika.
   Zadna vymyslena cisla, zadny odhad ztraty -- jen to, co sam zaskrtl.

   Poradi vetvi neni nahodne. "Nevim" prebiji "ne", protoze kdo si neni jisty,
   ten to jiste nevi -- a prave to je nejcastejsi realny stav. Vysledek
   "netyka se vas" musi byt dosazitelny, jinak je to kviz s predem danym
   koncem, a to clovek pozna. */
(function testZakona(){
  const f = document.getElementById('test');
  const v = document.getElementById('vysledek');
  if (!f || !v) return;

  const STAVY = {
    dopada: {znak: '!', nadpis: 'Zákon na vás nejspíš dopadá',
      text: 'Odvětví i velikost vám sedí. Další krok je postavit najisto, kterou '
          + 'z vašich činností vyhláška jmenuje jako regulovanou službu a v jakém '
          + 'režimu jste. Od chvíle, kdy podmínky splníte, běží šedesát dnů '
          + 'na ohlášení. Je to práce na dny, ne na měsíce.'},
    nevim: {znak: '?', nadpis: 'Nevíte to jistě, a to je nejčastější stav',
      text: 'Zrovna tohle se dá postavit najisto rychle. Projdeme odvětví, '
          + 'velikost celé vlastnicky propojené skupiny a vaše největší odběratele. '
          + 'Výsledkem může být i to, že se vás zákon netýká.'},
    /* Dodavatel regulovane firmy regulovanym subjektem NENI a sam se neohlasuje.
       Puvodni verze scitala tuhle otazku s odvetvim a velikosti jako rovnocennou,
       takze hlasila "zakon dopada" i firme, na kterou nedopada. Tohle je vlastni
       vetev: pravni odpoved je ne, obchodni odpoved je "dotaznik prijde tak jako tak". */
    retez: {znak: '→', nadpis: 'Zákon na vás nedopadá. Dotazník nejspíš přijde tak jako tak',
      text: 'Dodavatel regulované firmy regulovaným subjektem není, takže se sám '
          + 'neohlašujete. Váš zákazník ale musí hlídat bezpečnost svých dodavatelů '
          + 'a čtrnáct kategorií smluvních ujednání na vás přenese dodatkem ke '
          + 'smlouvě. Je to otázka obchodu, ne úřadu, a bývá dřív.'},
    nedopada: {znak: '✓', nadpis: 'Podle těchto tří otázek řešit nemusíte nic',
      text: 'Podle odvětví ani velikosti do zákona nespadáte a regulovanému '
          + 'zákazníkovi nedodáváte. Zálohy a přístupy si přesto zkontrolujte, '
          + 'ale to je jiná věc než soulad se zákonem.'},
    /* Vychozi stav. Musi byt v tomtez seznamu, aby se dal nastavit zpatky:
       kdyz je test nekompletni, nesmi na obrazovce zustat vysledek z drivejska
       a tvrdit neco, co clovek neodpovedel. */
    prazdno: {znak: '?', nadpis: 'Odpovězte na tři otázky výše',
      text: 'Výsledek se dopočítá sám. Jedna z možných odpovědí je, že se vás '
          + 'zákon netýká a nemusíte řešit nic.'}
  };

  function zobraz(stav){
    const s = STAVY[stav];
    if (stav === 'prazdno') delete v.dataset.stav; else v.dataset.stav = stav;
    v.querySelector('.vysledek-znak').textContent = s.znak;
    v.querySelector('h3').textContent = s.nadpis;
    v.querySelector('p').textContent = s.text;
  }

  function prepocitej(){
    const odpovedi = ['o1','o2','o3'].map(n => {
      const el = f.querySelector('input[name="' + n + '"]:checked');
      return el ? el.value : null;
    });
    if (odpovedi.some(o => o === null)) { zobraz('prazdno'); return; }
    const [odvetvi, velikost, dodavka] = odpovedi;

    /* Zakon dopada, jen kdyz sedi odvetvi A ZAROVEN velikost. Treti otazka
       o dodavkach regulovane firme je obchodni, ne zakonna -- proto ma vlastni
       vetev a nescita se s prvnimi dvema. */
    if (odvetvi === 'ano' && velikost === 'ano') zobraz('dopada');
    else if (odvetvi === 'nevim' || velikost === 'nevim') zobraz('nevim');
    else if (dodavka === 'ano') zobraz('retez');
    else zobraz('nedopada');
  }

  f.addEventListener('change', prepocitej);
})();
