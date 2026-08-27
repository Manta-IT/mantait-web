/* ===== Mobilni navigace =====
   Do 27. 8. se .menu pod 900 px vypnulo a nic ho nenahradilo: na telefonu
   nevedla z homepage na sluzbu zadna cesta krome scrollovani k dlazdicim.

   Prepinac i panel se skladaji tady, ne v HTML, aby to bylo na vsech devíti
   strankach jednim zapisem. Bez JS zustane stranka citelna, jen bez menu --
   proto se do panelu nedava nic, co by jinde nebylo. */
(function () {
  const nav = document.querySelector('nav');
  if (!nav || nav.querySelector('.nav-prepinac')) return;

  const menu = nav.querySelector('.menu');
  const cta = nav.querySelector('.nav-cta');
  if (!menu) return;

  const prepinac = document.createElement('button');
  prepinac.type = 'button';
  prepinac.className = 'nav-prepinac';
  prepinac.setAttribute('aria-expanded', 'false');
  prepinac.setAttribute('aria-controls', 'navPanel');
  prepinac.innerHTML = '<span class="nav-carky" aria-hidden="true"></span>Menu';

  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = 'navPanel';

  /* 1. Menu. Odkazy se berou z existujiciho .menu, aby nevznikl druhy seznam,
        ktery by se pri kazde zmene musel hlidat zvlast. */
  const panelMenu = document.createElement('div');
  panelMenu.className = 'panel-menu';
  const sipka = '<svg class="sipka-ven" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  menu.querySelectorAll('a').forEach(a => {
    const kopie = document.createElement('a');
    kopie.href = a.getAttribute('href');
    kopie.innerHTML = '<span>' + a.textContent.trim() + '</span>' + sipka;
    if (a.hasAttribute('aria-current')) kopie.setAttribute('aria-current', 'page');
    panelMenu.appendChild(kopie);
  });
  panel.appendChild(panelMenu);

  if (cta) {
    const kopieCta = document.createElement('a');
    kopieCta.className = 'panel-cta';
    kopieCta.href = cta.getAttribute('href');
    kopieCta.textContent = cta.textContent.trim();
    panel.appendChild(kopieCta);
  }

  /* 2. Obsah stranky. Stranka sluzby ma na mobilu pres dvacet obrazovek;
        bez tohohle se v ni neda skocit nikam. Na kratke strance (pod tri
        sekce) je to naopak seznam, ktery neusetri ani jedno posunuti. */
  /* Jeden selektor, jinak se tytez nadpisy vracely vickrat a v poradi DOM
     to pak necetlo shora dolu. */
  const nadpisy = [...document.querySelectorAll('section h2')]
    .filter(h => h.getClientRects().length);
  if (nadpisy.length >= 3) {
    const obsah = document.createElement('nav');
    obsah.className = 'panel-obsah';
    obsah.setAttribute('aria-label', 'Obsah stránky');
    const seznam = document.createElement('ol');
    nadpisy.forEach((h, i) => {
      const cil = h.closest('section') || h;
      if (!cil.id) cil.id = 'sekce-' + (i + 1);
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + cil.id;
      /* Nadpisy jsou casto dvouradkove ("Tohle je dnes bezne.Kolik toho mate?"),
         zlom se v textContent ztrati -- proto se doplnuje mezera. */
      /* Nadpisy jsou v HTML zlomene <br>, takze v textContent vznikne
         "bezne.Kolik" bez mezery. Zlom se bere z markupu, ne odhadem z pismen. */
      const kopieH = h.cloneNode(true);
      kopieH.querySelectorAll('br').forEach(br => br.replaceWith(' '));
      a.textContent = kopieH.textContent.trim().replace(/\s+/g, ' ');
      li.appendChild(a);
      seznam.appendChild(li);
    });
    obsah.innerHTML = '<span class="stitek">Na této stránce</span>';
    obsah.appendChild(seznam);
    panel.appendChild(obsah);
  }

  nav.insertBefore(prepinac, cta || null);
  document.body.appendChild(panel);

  function zavri() {
    prepinac.setAttribute('aria-expanded', 'false');
    panel.classList.remove('otevreny');
    document.body.classList.remove('panel-otevreny');
  }
  function otevri() {
    prepinac.setAttribute('aria-expanded', 'true');
    panel.classList.add('otevreny');
    document.body.classList.add('panel-otevreny');
    oznacTady();
  }

  prepinac.addEventListener('click', () =>
    prepinac.getAttribute('aria-expanded') === 'true' ? zavri() : otevri());
  panel.addEventListener('click', e => { if (e.target.closest('a')) zavri(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') zavri(); });
  /* Prechod na siroke okno musi panel zavrit, jinak zustane viset neviditelny
     a drzi body v overflow:hidden. */
  matchMedia('(min-width:901px)').addEventListener('change', e => { if (e.matches) zavri(); });

  /* Ktera sekce je prave videt. Pocita se az pri otevreni, ne pri scrollu --
     na dvacetiobrazovkove strance by to jinak bezelo poste zbytecne. */
  function oznacTady() {
    const odkazy = panel.querySelectorAll('.panel-obsah a');
    let tady = null;
    odkazy.forEach(a => {
      a.classList.remove('tady');
      const cil = document.getElementById(a.getAttribute('href').slice(1));
      if (cil && cil.getBoundingClientRect().top <= 120) tady = a;
    });
    if (tady) tady.classList.add('tady');
  }
})();

/* ===== Vycty na uzkem okne: skladani =====
   Duvod je v mobil.css. Tady jen mechanika: na uzkem okne se z kazde polozky
   stane rozbalovaci radek, na sirokem se nic nedeje.

   Trida se pridava a odebira podle sirky okna, ne jednou pri nacteni -- kdo
   otoci telefon na sirku, ma dostat mrizku, ne slozeny seznam. */
(function () {
  const uzke = matchMedia('(max-width:900px)');
  const skupiny = [...document.querySelectorAll('.doklady')]
    .filter(g => g.querySelectorAll('.doklad > h3').length >= 4);
  if (!skupiny.length) return;

  /* Sekce, jejiz text vybizi ke scitani, dostane navic pocitadlo. Poznava se
     podle textu, ne podle tridy: kdyz veta zmizi, zmizi i pocitadlo, a nezustane
     tu odskrtavani, ktere uz nikdo necetl. Jinde by to byla sablona. */
  function vybiziKSecteni(skupina) {
    const uvod = skupina.closest('section')?.querySelector('.lead');
    return !!uvod && /se[cč]t[eě]te|kolik jich m[aá]te/i.test(uvod.textContent);
  }

  skupiny.forEach(skupina => {
    const polozky = [...skupina.querySelectorAll('.doklad')];
    const scita = vybiziKSecteni(skupina);
    let pocitadlo = null;

    if (scita) {
      pocitadlo = document.createElement('p');
      pocitadlo.className = 'pocitadlo';
      pocitadlo.hidden = true;
      pocitadlo.innerHTML = '<b>0</b><span>z ' + polozky.length +
        '. Klepnutim na "mame" si odskrtnete, co u vas uz bezi.</span>';
      skupina.after(pocitadlo);
    }

    polozky.forEach(p => {
      const h = p.querySelector(':scope > h3');
      const telo = p.querySelector(':scope > div');
      if (!h || !telo) return;

      /* Obsah musi byt JEDEN potomek. Skladani jede na grid-template-rows
         0fr -> 1fr a to urcuje vysku prvniho radku; kdyz jsou uvnitr dva
         prvky (odstavec a poznamka), druhy dostane vlastni radek s auto
         vyskou a slozena polozka porad meri 74 px misto nuly. */
      if (!telo.querySelector(':scope > .doklad-telo')) {
        const obal = document.createElement('div');
        obal.className = 'doklad-telo';
        while (telo.firstChild) obal.appendChild(telo.firstChild);
        telo.appendChild(obal);
      }

      if (scita) {
        const znacka = document.createElement('span');
        znacka.className = 'mam';
        znacka.textContent = 'máme';
        h.appendChild(znacka);
        znacka.addEventListener('click', e => {
          e.stopPropagation();          /* odskrtnuti nerozbaluje podrobnost */
          p.classList.toggle('mame');
          prepocitej();
        });
      }

      h.addEventListener('click', () => {
        if (!uzke.matches) return;
        p.classList.toggle('otevreny');
        h.setAttribute('aria-expanded', p.classList.contains('otevreny'));
      });
      h.setAttribute('role', 'button');
      h.setAttribute('tabindex', '0');
      h.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h.click(); }
      });
    });

    function prepocitej() {
      if (!pocitadlo) return;
      const n = polozky.filter(p => p.classList.contains('mame')).length;
      pocitadlo.querySelector('b').textContent = n;
    }

    function nastav() {
      skupina.classList.toggle('skladatelne', uzke.matches);
      if (pocitadlo) pocitadlo.hidden = !uzke.matches;
      if (!uzke.matches) polozky.forEach(p => {
        p.classList.remove('otevreny');
        p.querySelector(':scope > h3')?.removeAttribute('aria-expanded');
      });
    }
    nastav();
    uzke.addEventListener('change', nastav);
  });
})();
