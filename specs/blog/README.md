# Blog modul Manta IT -- spec (WH1)

Owner: Petr Kokoska | Stav: navrh, ceka na schvaleni | Zdroj ukolu: `TASKS.md` blok "WEB = INFORMACNI HUB" (WH1)

Rozsiruje existujici vzor `web/clanky/dotace-technologie-pro-mas-2026.html` (1 clanek)
na opakovatelny system: index, sablona, publikacni checklist. Staticky web, zadny
framework, zadny build krok -- jen o trochu vic souboru a jeden maly Python skript
navic (stejny vzor jako uz existujici `scripts/bump-cache.py`).

## Shrnuti rozhodnuti

| Otazka | Rozhodnuti | Proc (strucne) |
|---|---|---|
| URL schema clanku | `/clanky/<slug>` (bez pripony) | uz plati pro existujici clanek, sedi s konvenci zbytku webu |
| URL indexu | `/clanky/` (se slash) | Cloudflare defaultne presmerovava adresarovy index na tvar se slash (overeno, viz sekce 1) |
| Razeni indexu | sestupne dle `date_published` | ctenar chce nejnovejsi prvni |
| Stitky/kategorie | NE v1 | 1 clanek dnes, kategorizace by byla predcasna |
| Strankovani | NE v1, prah ~20 clanku | jedna stranka je pri nizkych poctech jednodussi a rychlejsi |
| RSS | NE v1 | cilovka (SMB reditele 50+) RSS aktivne nepouziva, sitemap.xml + llms.txt uz pokryvaji strojove objevovani |
| Zdroj dat pro index + homepage highlighty | `clanky/manifest.json` | jediny zdroj pravdy pro WH1 (index) i WH4 (homepage), zadne parsovani HTML |
| Jak se index generuje | maly skript cte manifest, prepise staticke HTML | client-side JS fetch by byl neviditelny pro AI crawlery bez JS (viz sekce 5) -- a presne AI citovatelnost je cely smysl teto feature |
| sitemap.xml / llms.txt update | rucni checklist, zadny skript | objem ~1-3 clanky/mesic nevyzaduje automatizaci; skript az kdyz bude bolet (viz sekce 6) |

---

## 1. URL schema a struktura souboru

**Clanky zustavaji ploche v `web/clanky/`, jeden soubor na clanek**, presne jako dnes:

```
web/clanky/
  dotace-technologie-pro-mas-2026.html   (existujici)
  <novy-slug>.html
  manifest.json                           (novy, sekce 5)
  index.html                              (novy, sekce 2)
  _template.html                          (novy, kostra pro dalsi clanek)
```

Zadne podadresare per clanek, zadne `/clanky/2026/08/...` cesty s datem v URL --
zbytecna slozitost pro plochy seznam v radu jednotek az nizkych desitek clanku.
Kdyz bude clanku stovky, prehodnotit; do te doby YAGNI.

**Slug:** kebab-case, ASCII (bez diakritiky -- diakritika v URL je zbytecne riziko
kodovani), popisny, bez pripony v canonical URL. Stejna konvence jako existujici
`dotace-technologie-pro-mas-2026`.

**Canonical URL:**
- Clanek: `https://mantait.cz/clanky/<slug>` (bez `.html`, bez trailing slash) --
  uz plati pro zivy clanek, zadna zmena.
- Index: `https://mantait.cz/clanky/` (SE trailing slash).

Overeno u Cloudflare Workers static assets dokumentace (`html_handling`, default
`auto-trailing-slash`, tenhle web ho v `wrangler.jsonc` nijak neprepisuje):
jednotlive soubory (`foo.html`) se servíruji BEZ slash, adresarovy index
(`foo/index.html`) SE slash -- pozadavek na `/clanky` dostane 307 na `/clanky/`.
Zadna zmena `wrangler.jsonc` neni potreba, chovani uz dnes odpovida tomu, co
potrebujeme. Kdyz nekdo bude v budoucnu pridavat odkaz na index (napr. do nav
nebo homepage), odkazovat rovnou na `/clanky/` se slash, at' se usetri
presmerovaci hop.

---

## 2. Index clanku `/clanky/`

- **Razeni:** sestupne dle `date_published` z manifestu (nejnovejsi nahore). Zadne
  rucni razeni, poradi v `manifest.json` je nepodstatne.
- **Stitky/kategorie:** NE v1. Task sam napovidal "zatim ne" a souhlasim -- s
  1 clankem dnes a hrstkou planovanych temat (WH3: dotace, NIS2, AI ve firme...)
  by kategorizace byla predcasna abstrakce nad neexistujicimi daty. Pridat, az
  bude realny pripad, kdy ctenar/klient rekne "chci jen clanky o dotacich" nebo
  pocet clanku prekroci ~15-20.
- **Strankovani:** NE v1. Vsechny clanky na jedne strance, dokud jich neni tolik,
  aby stranka byla znatelne tezka (orientacne ~20 clanku). Pri nizkem publikacnim
  tempu (viz namet v `STATUS.md`: "1 clanek/2 tydny") je to otazka radove roku.
- **Layout:** doporucuji znovupouzit existujici `.grid`/`.tile` vzor z homepage
  (uz stylovany, uz responzivni, uz pouziva `--max-w`/`--pad-x`) -- karta na
  clanek: nadpis, kratky popis (z `description` v manifestu), datum, "Cist dal ->".
  Presna trida/markup je implementacni detail, rozhodne se pri kodovani; nova CSS
  jen pokud existujici vzor vizualne nesedi.
- **JSON-LD:** index dostane `Blog` schema s polem `blogPost` (kazda polozka:
  `headline`, `url`, `datePublished`) generovanym ze stejneho manifestu jako karty.
  Levna pridana hodnota presne pro GEO cil teto feature -- LLM/crawler najde
  cely seznam clanku v jednom strukturovanem bloku, ne jen jednotlive stranky.

---

## 3. Sablona clanku -- povinne prvky

Podle existujiciho `dotace-technologie-pro-mas-2026.html`, formalizovano jako
pozadavek pro VSECHNY dalsi clanky:

**Head:**
- `<title>` ve tvaru `<nadpis clanku> - Manta IT` (existujici konvence,
  odlisna od produktovych stranek kde brand nevede)
- meta `description`
- `canonical` presne dle sekce 1
- OG sada: `og:title`, `og:description`, `og:type=article`, `og:locale=cs_CZ`,
  `og:url`, `og:site_name`, `og:image`
- `twitter:card=summary_large_image`
- favicon, font preconnect + link, `/style.css?v=...`, `gtag.js` -- shodne se
  zbytkem webu
- **JSON-LD Article** (povinne, ne volitelne): `headline`, `description`,
  `inLanguage`, `datePublished`, `dateModified`, `author` (Person, vzdy Petr
  Kokoska), `publisher` (Organization Manta IT), `mainEntityOfPage`, `image`,
  `about[]`
- **JSON-LD FAQPage** -- jen kdyz clanek ma skutecny FAQ obsah (viz sekce 7),
  ne pro kazdy clanek povinne

**Body:**
- Standardni `<nav>` a `<footer>` -- presna kopie z existujicich stranek
  (zadna varianta pro clanky, jednotne menu jak uz vyzaduje `PRINCIPLES.md`)
- Hero: eyebrow + `<h1>` s `<em>` akcentem + lead odstavec, ktery sam o sobe
  dava smysluplnou odpoved (definition-first vzor, uz zavedeny v
  `PRINCIPLES.md` sekce 5 pro homepage, plati stejne pro clanky)
- Byline: "Petr Kokoska, Manta IT · publikovano D. M. RRRR" -- viditelne
  datum publikace vedle JSON-LD data (clovek i stroj vidi totez)
- Sekce `.lp-section` s prubeznym citovanim externich zdroju (`rel="nofollow"`,
  datum zdroje uvedene u tvrzeni) -- tohle je hlavni GEO diferenciator webu
  (viz existujici clanek), plati pro kazdy clanek ktery uvadi cisla/citace
- **Minimalne 1 kontextovy interni odkaz** v tele textu (ne jen v CTA bloku)
  na `/dotace-mas` nebo relevantni `/reseni-*` stranku -- vyber cile je
  redakcni rozhodnuti per clanek (temata resi WH3), ne technicke pravidlo
- **CTA blok** (`.lp-price` vzor) na konci clanku, odkazujici na JEDNU
  nejrelevantnejsi produktovou/landing stranku pro tema clanku (u dotacniho
  clanku `/dotace-mas`, u budouciho NIS2 clanku `/reseni-bezpecnost`, atd.).
  Druhy CTA blok v polovine clanku je volitelny (existujici clanek ho ma,
  neni to povinne pro kratsi clanky)
- FAQ sekce (`<details><summary>`) -- jen kdyz dava smysl, zrcadli JSON-LD
  FAQPage kdyz existuje

**Autor:** vzdy Petr Kokoska, zadny vyber autora -- jednoclovecí brand,
komplikovat autorstvi by bylo spekulativni.

**Obrazky v tele clanku:** zadna existujici konvence (vzorovy clanek je cely
text/tabulky, bez obrazku). V1 pouziva pro OG/Twitter kartu sdileny
`/og-image.png` (`og_image` pole v manifestu je pripravene, ale nepovinne --
viz sekce 5). Rozhodnout konkretni pristup (per-clanek obrazek, kde hostovat)
az prvni clanek obrazek fakticky potrebuje.

---

## 4. RSS -- rozhodnuti: NE v1

**Duvody:**
1. Cilovka (SMB reditele 50+, "bryle na blizko" dle `PRINCIPLES.md`) RSS
   ctecky aktivne nepouziva -- nulova poptavka od lidskych ctenaru.
2. Strojove objevovani noveho obsahu uz dnes resi dva kanaly: `sitemap.xml`
   (standardni SEO signal) a `llms.txt` (cilene na LLM citace, uz existuje a
   je to novejsi/presnejsi format prave pro tenhle ucel nez RSS).
3. Pridana hodnota RSS nad temito dvema kanaly pro AI crawlery je nejasna a
   neni podlozena -- zatimco RSS feed je dalsi soubor, ktery se musi rucne
   udrzovat synchronne pri kazdem clanku (dalsi krok v uz tak rucnim workflow).
4. Neni to nevratne rozhodnuti. Kdyz `manifest.json` existuje (sekce 5), pridat
   `/clanky/feed.xml` pozdeji je male rozsireni generacniho skriptu, ne novy
   subsystem.

**Kdy prehodnotit:** konkretni konzument RSS se objevi (novinar, agregator,
partnerska MAS s newsletterem, ktery RSS chce), nebo analytics ukazou provoz
z feed readeru.

---

## 5. Manifest -- interface pro index a pro WH4 (homepage highlighty)

`web/clanky/manifest.json` -- jediny JSON soubor, pole objektu, jeden na clanek:

```json
[
  {
    "slug": "dotace-technologie-pro-mas-2026",
    "title": "Posledni velke kolo dotaci na technologie je o polovinu mensi",
    "description": "540 milionu korun ve vyzve Technologie pro MAS II proti az miliarde v predchozim kole...",
    "date_published": "2026-08-08",
    "date_modified": "2026-08-10",
    "highlight": true,
    "cta_href": "/dotace-mas",
    "og_image": null
  }
]
```

Pole: `slug`, `title`, `description`, `date_published`, `date_modified`
(povinna), `highlight` (bool, default false -- WH4 kontrakt: homepage
zobrazi clanky s `true`, kolik jich a jak, resi WH4), `cta_href` (volitelne,
informativni), `og_image` (volitelne, `null`/chybi = pouzij sdileny
`/og-image.png`).

**Proc JSON manifest a ne parsovani HTML:** stranka nema build krok. Bez
manifestu by index musel bud (a) parsovat HTML kazdeho clanku za behu
(krehke, pomale, N HTTP requestu), nebo (b) mit kazdou kartu rucne
duplikovanou v indexu i pripadne na homepage (dva mista se stejnymi daty).
Jeden JSON soubor, ktery cte maly skript pri publikaci, resi oboje a presne
tohle uz task pojmenoval jako pozadavek pro WH4 ("at' homepage build nemusi
parsovat HTML").

**Proc skript generuje staticke HTML, ne client-side JS fetch:**
Zvazoval jsem `fetch('/clanky/manifest.json')` primo v prohlizeci a vykresleni
karet JS-em -- jednodussi na prvni pohled. Problem: verejne dokumentovani
AI crawleri, ktere `robots.txt` teto stranky explicitne vpousti (GPTBot,
ClaudeBot, PerplexityBot, CCBot, anthropic-ai), fungujici primarne jako HTTP
fetchery bez renderovani JS -- tohle je moje bezne chapani jejich chovani,
ne cerstve overeny fakt pro kazdeho z nich jednotlive, ale zavisly na JS pro
KLICOVY obsah je riskantni presne v okamziku, kdy cilem cele funkce je AI
citovatelnost. Kdyby index i homepage highlighty existovaly jen v datech,
ktera se dopocitavaji az v prohlizeci, mohly by byt pro cast crawleru
neviditelne -- ticha chyba, ktera by se projevila az za mesice ("proc nas
LLM necituje"). Bezpecnejsi a stejne levne reseni: maly skript
(`scripts/gen_clanky_index.py`, stejny vzor jako existujici
`scripts/bump-cache.py` -- stdlib, zadna nova zavislost) prepise staticky
HTML blok v `clanky/index.html` (mezi znackovacimi komentari, napr.
`<!-- CLANKY:START -->` / `<!-- CLANKY:END -->`) podle obsahu manifestu.
Vysledek je čisty staticky HTML soubor, zadna JS zavislost pro obsah, ktery
ma byt citovatelny.

**Doporuceni pro WH4 (mimo scope teto specifikace, jen navaznost):** az
WH4 vznikne, pouzit stejny vzor -- skript, ktery ze stejneho manifestu
prepise staticky blok na homepage, ne client-side fetch. Zminuji to tady,
protoze kontrakt (`manifest.json` schema vyse) uz je hotovy a WH4 by ho mel
jen precist, ne vymyslet vlastni.

---

## 6. Publikacni workflow

Novy clanek = tento checklist:

1. **Napsat obsah** (Claude session + WebSearch na zdroje, cituje je jako
   vzorovy clanek -- min. datum + odkaz u kazdeho cisla/tvrzeni)
2. **Zkopirovat `clanky/_template.html` -> `clanky/<slug>.html`**, vyplnit
   podle sekce 3 (povinne prvky)
3. **Pridat zaznam do `clanky/manifest.json`**
4. **Spustit `python scripts/gen_clanky_index.py`** -- prepise
   `clanky/index.html` (karty + Blog JSON-LD) podle manifestu
5. **Pridat `<url>` do `sitemap.xml`** (`lastmod` = `date_published`)
6. **Pridat radek do `llms.txt`** (stejny vzor jako existujici bullet pro
   dotacni clanek)
7. **Spustit `python scripts/bump-cache.py`** (uz dnes pocita s `clanky/`
   podadresarem -- `SUBDIRS = ['clanky']` v existujicim skriptu)
8. **Checklist pred commitem** (uz plati sitewide dle `CLAUDE.md`): ASCII
   grep, console errors, mobile viewport 600px -- rozsirit i na novy clanek
   a prepsany index
9. **Commit + push na `master`** = deploy (existujici model, zadna zmena)

**Kdo aktualizuje sitemap/llms.txt:** rucni krok (5, 6), zadny skript v1.
Zduvodneni: tempo ~1-3 clanky mesicne (viz `STATUS.md` namet "1 clanek/2
tydny") nevytvari dost prilezitosti k chybe, aby se vyplatilo psat a udrzovat
validacni skript. Kdyz publikacni tempo vzroste nebo rucni sync zacne
skutecne selhavat (clanek v manifestu bez radku v sitemap a podobne),
prvni levny upgrade je validacni skript (porovna `manifest.json` proti
`sitemap.xml`/`llms.txt` a nahlasi rozdil), teprve pak pripadna plna
automatizace generovani. Zadny z techto kroku neni soucasti v1.

**Poctivy trade-off:** kazdy clanek dnes existuje ve 4 mistech (`.html`
soubor, `manifest.json`, `sitemap.xml`, `llms.txt`) -- realna duplicita dat
(title/datum se opakuje). Alternativa (jeden zdroj -- napr. YAML frontmatter
v kazdem clanku -- a build skript, ktery z nej vygeneruje zbytek) by tohle
odstranila, ale znamena skutecny build krok, ktery si tenhle projekt vedome
nechce (`CLAUDE.md`: "Zadny build, zadny lint, zadny framework"). Pri 1-3
clancich mesicne je rucni sync levnejsi nez postavit a udrzovat generator.

---

## 7. SEO/GEO pozadavky

- **Nadpisova hierarchie:** presne jeden `<h1>` (nadpis clanku), `<h2>` per
  sekce, zadne preskakovani urovni (h2 nikdy rovnou na h4). FAQ `<summary>`
  neni nadpis, je to interaktivni prvek -- v poradku dle existujiciho vzoru.
- **FAQ bloky:** jen kde je skutecny Q&A obsah (existujici clanek je dobry
  priklad -- 6 otazek, ktere lide fakt maji). Vzdy jako pár: viditelny
  `<details>` + JSON-LD `FAQPage` se stejnym obsahem, nikdy jen jedno z toho.
- **Citovatelnost:** kazde cislo/tvrzeni/citace v tele clanku ma inline zdroj
  (`rel="nofollow"` odkaz) s datem -- uz zavedeny vzor, tady jen formalizovany
  jako pozadavek pro vsechny dalsi clanky, ne jen ten prvni.
- **Definition-first hero:** lead odstavec musi sam o sobe fungovat jako
  citovatelna odpoved na "o cem je tenhle clanek" -- rozsirenim existujiciho
  pravidla z `PRINCIPLES.md` (puvodne psano pro homepage, plati stejne dobre
  pro clanky).
- **`llms.txt`:** kazdy clanek dostane jeden bullet pod "Hlavni stranky",
  stejny format jako existujici zaznam -- krok 6 v publikacnim checklistu.
- **`robots.txt`:** zadna zmena, uz vpousti relevantni AI crawlery plosne pro
  cely web vcetne `/clanky/`.

---

## 8. Mimo scope v1

- **Komentare** -- potrebuji bud 3rd-party JS widget (koliduje s uz
  nastavenym prisnym CSP v `_headers`) nebo vlastni backend (Worker + DB).
  Zadna z variant neni trivialni, nikdo o to nepozadal.
- **Newsletter/email capture z blogu** -- samostatna feature s vlastnim
  rozhodovanim o ESP (a `TASKS.md` uz ukazuje silny odklon od ESP pro cold
  mail -- R11). Neresi WH1-4.
- **Fulltextove vyhledavani** -- YAGNI pri <20 clancich.
- **Stitky/kategorie** -- viz sekce 2.
- **Strankovani** -- viz sekce 2.
- **RSS feed** -- viz sekce 4 (zduvodnene NE, ne prehlednuti).
- **Vice autoru** -- jednoclovecí brand, nepotrebne.
- **"Podobne clanky" / related content widget** -- potreboval by tagovani
  nebo rucni kuraci, nikdo o to nepozadal, pridat az bude dost clanku, aby to
  davalo smysl.
- **SK/EN preklad clanku** -- `TASKS.md` DT13 rika prelozit web krome
  dotacniho landingu; blog v produkci jeste neexistuje, takze i18n blogu
  neni soucasti zadani WH1. Otevrit, az/pokud DT13 dorazi k blogu.
- **Per-clanek obrazky** -- viz sekce 3, resit az bude potreba.

---

## Co WH1 implementace konkretne vytvori

Checklist pro dalsi (kodovaci) krok, odvozeny z teto specifikace:

1. `web/clanky/manifest.json` -- seedovany jednim existujicim clankem
2. `web/clanky/_template.html` -- kostra clanku se vsemi povinnymi prvky
   ze sekce 3 (placeholder znacky)
3. `web/clanky/index.html` -- staticka stranka + generovany blok karet a
   `Blog` JSON-LD (viz sekce 5)
4. `web/scripts/gen_clanky_index.py` -- cte manifest, prepise oznaceny blok
   v `index.html` (stdlib only, stejny styl jako `bump-cache.py`)
5. Update `web/sitemap.xml` -- pridat `/clanky/` (index) jako novou URL
6. Update `web/CLAUDE.md` / `PRINCIPLES.md` -- zapsat blogovy modul do
   existujici sitewide dokumentace (nova stranka `/clanky/` do seznamu
   stranek, publikacni checklist do "Workflow" sekce)

## Poznamka k nasazeni (najito pri psani specu, nutne pro implementaci)

`web/specs/` (tenhle adresar) a `clanky/_template.html` **musi pribyt do
`.assetsignore`**, jinak se nasadi jako verejne dostupne stranky --
`assets.directory` v `wrangler.jsonc` je cely `web/` root a `.assetsignore`
dnes vyjimá jen `docs/`, `scripts/`, interni `.md` soubory apod. (specs/ tam
zatim neni, protoze do teto chvile neexistoval). `clanky/manifest.json`
naopak **zustava verejny umyslne** -- neobsahuje nic citliveho (title/popis/
datum uz jsou verejne v HTML kazdeho clanku) a generacni skript i pripadny
budouci RSS/WH4 kod ho potrebuji cist.

## Otevrene body -- nic neblokuje, ale stoji za vedomi

- **RSS = NE** (sekce 4) je reverzibilni rozhodnuti s jasnym zduvodnenim,
  ne technicke omezeni -- kdyby mel Petr jiny signal (napr. konkretni partner
  chce feed), staci rict a pridat se dá rychle.
- **Manifest = 4. misto se stejnymi daty** (sekce 6, trade-off) -- pri
  soucasnem tempu je to v poradku, ale stoji za pripomenuti, kdyby se
  publikacni tempo skokove zvedlo (napr. Promo Engine adaptace z WH2 zacne
  generovat clanky rychleji, nez rucni sync zvladne).
- **WH4 (homepage highlighty)** neni soucasti teto specifikace -- kontrakt
  (`manifest.json` schema) je pripraveny, ale "kolik clanku highlightovat"
  a presny vzhled sekce je rozhodnuti pro WH4, az vzniknou 2-3 clanky (dle
  `TASKS.md`).
