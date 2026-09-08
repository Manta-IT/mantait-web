# MantaIT Web -- CONTEXT

## Co to je

Verejny web mantait.cz -- hlavni dukazni material znacky. Hook pro navstevnika
NENI vycet referenci: semi-warm kontakt uz o Mante vi a prisel overit, ze je
to real deal. Presvedci ho provedeni samotneho webu ("i ten web vypada, ze
sakra vime, co delame"). Firma prodavajici digitalizaci se dokazuje tim, jak
vypada jeji vlastni web.

## Stav (8. 9. 2026)

- **Produkce:** novy design system nasazeny 26. 8. 2026 (commit 5765313),
  nabidka jako cyklus firmy od 8. 9. (8dd3d2c, c585dc7). 12 stranek
  prepsanych od zakladu, zdroj je `../specs/web-redesign/prototypy/`,
  prenos `../specs/web-redesign/prenos.py`. Zbytek (dotace-mas, raynet,
  dodavatele, clanky, ...) jede na mustku `style.css` a ceka na prepsani.
- **SK a EN** jsou od 8. 9. odpojene: `/sk/*` a `/en/*` 301 na `/`, bez
  hreflang, mimo sitemap. Soubory zustavaji v repu do prekladu.
- **Zanikle cesty** (`reseni-ai`, `reseni-naklady`, `reseni-nastroje`,
  `reseni-projekt`, `reseni-web`, `kontakt`) jsou 301 v `_redirects`.
- Clanky: `clanky/manifest.json` je zdroj hubu, publikace jen skriptem
  (`scripts/clanek_publikuj.py`). Formular dodavatelu `/dodavatele` od 31. 8.
- Deploy: Cloudflare Workers Builds z `master`. Stav a rozhodnuti redesignu:
  `../specs/web-redesign/STAV.md`, nabidky: `../specs/web-nabidka/design.md`.

## Pozice a obsah

- Claim: **"Vy ridite firmu. Ja vase IT."** (od 24. 7.)
- Pozice (korekce Petra 25. 8.): technologicky lidr, ktery vede digitalni
  transformaci firem do ~250 lidi -- ne IT manager na spravu pocitacu.
- Cilovka: majitele ne-tech firem, 50+, nesnasi zargon.
- Nabidka jako cyklus firmy (od 8. 9. 2026): sedm kroku radu 1 (Priprava
  firmy, Zadani, Vyber systemu, Aplikace na miru, Propojeni, Podnikova AI,
  Vedeni IT) + produkty radu 3 (AI plan 9 900, AI zamestnanec 89 000, Robot
  na zadani, Web pro dobu AI 35 000, Dotace na klic 30 000). Bezpecnost je
  tema v pruhu, ne sluzba. Zdroj: `../specs/web-nabidka/design.md`, ceny
  hlida `scripts/kontrola_webu.py` (registr `sluzby.json`).
- Mereni: pocet poptavek pres formular (/dekujeme). GA4 se nezaklada.

## Otevrene otazky

- **Pozvanky do kalendare** z vyberu terminu (T0825-36) -- ceka na Petruv
  OAuth a mapovani casti dne.
- Benchmark cen konkurence (Digitisk 648-793 tis.) se NIKDY neuvadi jako
  srovnani na webu -- smi byt jen "radovy rozpocet" bez vazby na dodavatele.

## Souvislosti

- Parent workspace `../` (manta-it): leadgen, kampane, CRM, brand.
- Pravidla prace: `CLAUDE.md` (zavazna), `PRINCIPLES.md` (proc).
- Clanky plni pipeline: obsah z redesignu se recykluje do clanku a kampani
  (reserse `../specs/web-redesign/vyzkum-bolesti-vyvoje.md`).
