# CLAUDE.md -- web

Pravidla pro Claude Code pri praci na webu Manta IT. Drz se. Detail a "proc" je v `PRINCIPLES.md`.

> **BEZI REDESIGN (T0825-7, srpen 2026).** Pravidla nize popisuji NOVY design
> system. Produkce (`master`) zatim nese stary web (bezova paleta, EB Garamond)
> a nasazuje se az CELY novy web najednou vcetne SK/EN -- do te doby se do
> produkcnich stranek nesaha (rozhodnuti Petra 25. 8.). Nutna obsahova oprava
> produkce pred releasem se dela ve stylu stavajiciho kodu (`style.css`), ne
> podle novych design pravidel, a musi se prenest i do prototypu.
> Zdroj pravdy redesignu: `../specs/web-redesign/STAV.md`, prototypy tamtez.

## Co to je

Web Manta IT: staticke HTML + sdileny stylesheet, zadny framework, zadny build
step (jen pomocne Python generatory SVG ilustraci). Produkce ma 65 stranek
(20 CZ + 20 SK + 20 EN + 5 clanku). Novy web ma zatim 8 stranek v
`../specs/web-redesign/prototypy/`:

- `web-v2.html` -- homepage: hero, pruh clanku, reference s logy, co delam,
  obory, cenik, kontakt se tremi cestami
- `sluzba-vedeni-it.html` -- vedeni digitalni transformace (VZOR pro ostatni sluzby)
- `sluzba-aplikace.html` -- aplikace na miru, antikampan na stary model vyvoje
- `sluzba-propojeni.html` -- propojeni systemu, okruh
- `sluzba-bezpecnost.html` -- bezpecnost + self-check zakona
- `sluzba-ai-zamestnanec.html` -- AI zamestnanec, hranol + ranni hlaseni
- `kdo-jsem.html` -- bio + konstelace kategorii
- `clanky.html` -- rozcestnik clanku
- sdilene: `sluzba.css`, `sluzba.js`, `hranol.css`, `kruh.css`,
  `obrazky/` (SVG + generatory), `loga/`, `bump.py` (verzovani `?v=`)

Produkce navic: `dotace-mas.html` (POZOR na pivot sluzby 25. 8., viz nize),
`clanky/` (manifest.json = zdroj dat), `kontakt`, `weby`, `raynet`,
`case-kalkulacka`, `ukazka-reportu`, `soukromi`, `dekujeme`, `_redirects`,
`sk/`, `en/` (ceny v EUR, dotacni obsah vynechan).

## Workflow

1. Redesign: editace v `../specs/web-redesign/prototypy/`, preview
   `python -m http.server 8899` v te slozce. Po uprave sdileneho CSS/JS
   spustit `python bump.py` (jinak testujes starou verzi z cache).
2. Produkce (az po releasi): editace `.html` primo, CSS jen ve sdilenem
   stylesheetu, preview `python scripts/serve.py` -> `http://localhost:8773/`.
3. Testovat v prohlizeci, ne v kodu. Pro posouzeni hotoveho stavu vypnout
   animace (`*{animation:none !important}`).
4. Pred commitem: kazda stranka na 390/600/900/1440 px bez vodorovneho
   scrollu, console errors 0, ASCII grep cisty.

## Deployment

**Auto-deploy pres Cloudflare Workers Builds z `master`** (Worker `mantait-web`,
worker.js = staticke assety + POST /api/dotaznik a /api/kontakt pres Gmail API;
overeno 22. 8. 2026).
- Repo: `https://github.com/Manta-IT/mantait-web`
- Push do `master` = automaticky deploy do produkce
- Domena: `mantait.cz` (DNS na Cloudflare)
- **NESPOUSTET wrangler manualne**
- `.assetsignore` drzi interni soubory mimo verejnost -- pri zmene struktury zkontrolovat

**Commit workflow:**
```bash
sh scripts/install-hooks.sh    # po klonu jednou; pre-commit auto-bumpne ?v=hash
git add -A && git commit -m "fix: ..." && git push origin master
# fallback bez hooku: python scripts/bump-cache.py pred commitem
```

## Cache strategy

- HTML: max-age=300; CSS: 1 rok + immutable, verze pres `?v=<hash>`;
  sitemap.xml: 1h. Edge cache se purgne pri deployi.
- `scripts/bump-cache.py` updatuje `?v=` ve vsech HTML -- pustit pred kazdym
  commitem, ktery meni stylesheet.

## Zavazna pravidla (poruseni = chyba)

### Copywriting

- **ASCII-only v typografii.** Zadny em-dash, smart quotes, ellipsis --
  jen `-`, `"`, `'`, `...`. Ceska diakritika se ZACHOVAVA.
- **Bez IT zargonu v body copy.** Cilovka: majitele firem do ~250 lidi bez
  vlastniho IT. Slovnik nahrad je v `PRINCIPLES.md`.
- **Primarni CTA je "Napiste mi"** a vede na kontakt (od 25. 8., nahradilo
  "Domluvit schuzku" z doby Calendly). Ne "hovor", ne "objednat".
- **Zadne vymezovani vuci konkurenci** a slovo "bezkonkurencni" (Petr 24. 7.).
  Utok na MECHANIKU stareho modelu je povoleny, jmenovani ci implikovani
  konkurentu ne.
- **Zadne straseni**: zadne kalkulacky ztrat, zadny odhad skod. Na strance
  bezpecnosti stoji nase vlastni veta "straseni je spatny obchodni model".
- **Vina neni mechanika**: zaostalost pojmenovat naplno, ale vinu hned sejmout
  ("nikdo vam to nerekl") a presunout na rozhodnuti, ktere ctenar udela ted.
- **U vlastnich cen "nejsem platce DPH"**, nikdy "bez DPH".
- **U vyvoje povinna veta, ze kod vlastni klient.**
- **Modelova cisla vzdy s vetou pod carou**, ktera je odlisi od dolozenych --
  bez toho je to falesna presnost.
- **Zadna konkretni castka dotace v claimu.** Dotace (pivot 25. 8.): zadost
  zpracovavame a podavame my za 30 000 Kc (na plnou moc), sluzba konci podanim,
  zadna druha faktura ani provize. Obe zjednoduseni jsou chybna: "zadost poda
  kancelar" (bez soucinnosti zadatele nevznikne) i "podavate si ji vzdy sami"
  (na plnou moc ne). Uzke misto je kvalifikovany podpis jednatele a pristup
  do ISKP21+ -- resi se na zacatku. Dvojroli (specifikace + vlastni nabidka
  dodavky) v FAQ nepotvrzovat ani nevylucovat, dokud Petr nerozhodne T0825-59.
  Zdroj: `../leadgen/mas-baze/SPOLECNA-PRAVIDLA.md`, sekce "Kdo smi zadost
  fyzicky odeslat".
- **Zakazano kdekoli:** Ultramarin/UltraConfig, "Kokoska IT", MAS Humpolecko.

### Design

- **Paleta:** papir `#FBFBF9`, inkoust `#101413`, zelena `#0B6E4F` jako JEDINY
  akcent. `--vada #9A3F2B` vyhradne pro data, ktera varuji (nikdy dekorace,
  nikdy CTA). Pet spektralnich odstinu vyhradne pro kanaly hranolu na strance
  AI zamestnance, nikde jinde. *(Paleta schvalena Petrem 25. 8. 2026.)*
- **Pismo:** Outfit (display), Manrope (text), JetBrains Mono JEN pro strojova
  data (stitky, casy, cisla, zdroje) -- nikdy na prodejni text. Zadny serif.
- **Polomery:** `--r-s` 8 px drobne prvky, `--r` 10 px tlacitka a pole,
  `--r-l` 14 px velke panely. Jedna hodnota na vsem je zakazany extrem.
- **Pohyb:** jedna krivka `cubic-bezier(.23,1,.32,1)`; stisk do 160 ms, hover
  180-250 ms, stagger po 60 ms. Hover vzdy v
  `@media (hover:hover) and (pointer:fine)`.
- **Vychozi stav v CSS je vzdy KONCOVY.** Zavreny stav nasazuje skript tridou
  `pripravena`; odkryva sdilena funkce `odkryj()` v `sluzba.js` (observer +
  tvrdy casovac 5 s -- bez nej zustane v uspane zalozce prazdno).
- **Zadna dorustajici cisla** (nabihat smi jen diagram, ktery ukazuje pocet).
- **Zadne node diagramy** (Petr zakazal jmenovite).
- **Zadne tri stejne karty vedle sebe**; kazda sekce jina skladba; nikde dve
  tmave sekce po sobe.
- **Kontrast vsude WCAG AA minimum** (cilovka 50+); body text min. 15 px,
  drobne popisky min. 12 px; tap targets >= 44 px.
- **Ilustrace:** SVG kreslene generatorem (`prototypy/obrazky/generuj.py`),
  jeden mechanismus blok/linka/kruh. Test soudrznosti: kazdy tvar musi jit
  pojmenovat slovem z nasi prace. Kreslit s vedomim nejmensiho mista pouziti
  (linky 1,5 px pri zmenseni 4x zmizi).

### Struktura nabidky (neprehazovat bez Petra)

Cenik na homepage (stav 25. 8., prototyp):
- **AI plan do 48 hodin** -- 9 900 Kc pevne
- **Aplikace a systemy na miru** -- od 50 000 Kc, pevna cena za rozsah; kod vlastni klient
- **AI zamestnanec** -- 89 000 Kc, provoz od 8 000 Kc mesicne
- **Vedeni IT (digitalni transformace)** -- od 50 000 Kc mesicne; VZOR stranky je `sluzba-vedeni-it.html`
- **Dilci zakazky** -- 10 000 Kc/den
- **Web** -- 16 900 / 8 900 Kc podle rozsahu
- **Dotace na klic** -- 30 000 Kc pevne, konci podanim zadosti

Pozice (Petr 25. 8.): nejsme IT manager na spravu pocitacu, jsme technologicky
lidr, ktery vede digitalni transformaci. Stranky sluzeb podle vzoru vedeni-it.

### SEO / GEO

- `<link rel="canonical">` presne odpovida sitemap.xml, oba bez pripony `.html`.
- `robots.txt` allow AI crawlerum (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended, anthropic-ai, CCBot). POZOR na CF Managed robots (pentest 7. 8.).
- `llms.txt` udrzovat aktualni (ceny, nazvy sluzeb).
- Per-page OG meta + JSON-LD (ProfessionalService/Person/Service/FAQPage).
  FAQPage se na novych strankach generuje samo z viditelnych otazek (`sluzba.js`).
- Definition-first hero: prvni veta rekne jednou vetou, co to je.

### Reference

- **Seznam (Petr 25. 8., uvadet vsechny):** Cesky rozhlas, Radioteka, Prima,
  Czech News Center, UniHobby, Pro-Doma, Almeco. Loga stazena v
  `../specs/web-redesign/prototypy/loga/`, v pasu jako jednobarevne siluety
  (`grayscale(1) brightness(0)`), hover rozsviti.
- Formulace "Projekty, ktere jsem vedl" (ne "systemy, ktere jsem ridil" --
  slo o praci u dodavatelu, kontext je na Kdo jsem).
- Manta IT klienti (MHA, PlanetLine): pod NDA, MHA jen anonymne.
- **ZAKAZ (Petr 7. 8.):** Ultra Marine, UltraConfig.cz a vse ultramarinske
  se NIKDY neuvadi -- web, CV, nikde.
- Zadne fake reviews, zadne fake reference.

## Pred commitem checklist

1. ASCII grep: `grep -P '[\x{2010}-\x{2015}\x{2018}-\x{201F}\x{2026}]' *.html` -> 0 hitu
2. Console errors: 0 na kazde strance
3. 390/600/900/1440 px: zadny vodorovny scroll
4. CTA "Napiste mi" vede na kontakt, formular odesle a presmeruje na /dekujeme
5. Nav active state na kazde strance
6. FAQ schema se generuje (JSON-LD v DOM)

## Co NEDELAT

- Nepridavat JS framework ani build step. Vanilla nebo nic.
- Nevolat externi JS krome Google Fonts, Google Ads (gtag) a Cloudflare Web Analytics.
- Nezvysovat ani nesnizovat ceny bez Petrova pokynu.
- Nezavadet externi rezervacni widget (Calendly odstraneno 8/2026, nevraci se;
  duvody v `PRINCIPLES.md`).
- Nevkladat hidden metadata ani SEO triky.
- Nepridavat anglicismy do body copy.
- Nesahat do produkce pred releasem redesignu (viz banner nahore).
