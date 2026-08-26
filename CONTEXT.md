# MantaIT Web -- CONTEXT

## Co to je

Verejny web mantait.cz -- hlavni dukazni material znacky. Hook pro navstevnika
NENI vycet referenci: semi-warm kontakt uz o Mante vi a prisel overit, ze je
to real deal. Presvedci ho provedeni samotneho webu ("i ten web vypada, ze
sakra vime, co delame"). Firma prodavajici digitalizaci se dokazuje tim, jak
vypada jeji vlastni web.

## Stav (25. 8. 2026)

- **Produkce:** 65 stranek (20 CZ + 20 SK + 20 EN + 5 clanku), live na
  mantait.cz, Cloudflare Worker, deploy z `master`. Nese jeste STARY design.
- **Redesign (T0825-7):** 8 novych stranek v `../specs/web-redesign/prototypy/`,
  homepage Petr schvalil, zbytek ceka na schvaleni. Nasazuje se cely web
  najednou vcetne jazyku -- do te doby se do produkce nesaha.
  Stav a rozhodnuti: `../specs/web-redesign/STAV.md`.

## Pozice a obsah

- Claim: **"Vy ridite firmu. Ja vase IT."** (od 24. 7.)
- Pozice (korekce Petra 25. 8.): technologicky lidr, ktery vede digitalni
  transformaci firem do ~250 lidi -- ne IT manager na spravu pocitacu.
- Cilovka: majitele ne-tech firem, 50+, nesnasi zargon.
- Sluzeb pet: vedeni IT, aplikace na miru, propojeni a automatizace,
  bezpecnost a novy zakon, AI zamestnanec. K tomu clanky (obsahovy hub),
  dotace na klic (30 000 Kc, konci podanim) a web (16 900 / 8 900 Kc).
- Mereni: pocet poptavek pres formular (/dekujeme). GA4 se nezaklada.

## Otevrene otazky

- **Pet zanikajicich cest** (`reseni-ai`, `reseni-naklady`, `reseni-nastroje`,
  `reseni-projekt`, `reseni-web`): presmerovat, nebo nechat zit? URL muzou
  mit navstevnost.
- **Pozvanky do kalendare** z vyberu terminu (T0825-36) -- ceka na Petruv
  OAuth a mapovani casti dne.
- Benchmark cen konkurence (Digitisk 648-793 tis.) se NIKDY neuvadi jako
  srovnani na webu -- smi byt jen "radovy rozpocet" bez vazby na dodavatele.

## Souvislosti

- Parent workspace `../` (manta-it): leadgen, kampane, CRM, brand.
- Pravidla prace: `CLAUDE.md` (zavazna), `PRINCIPLES.md` (proc).
- Clanky plni pipeline: obsah z redesignu se recykluje do clanku a kampani
  (reserse `../specs/web-redesign/vyzkum-bolesti-vyvoje.md`).
