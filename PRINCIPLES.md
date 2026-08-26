# Manta IT web — principy

Detailní bible designu, copywritingu, pozicování a SEO. Pro lidi i pro Claude Code.
Pro tlustá pravidla viz `CLAUDE.md`. Tento dokument vysvětluje **proč**.

Zdroje: 4 subagent reporty (UX, copywriting, SEO/GEO, competitor) + Petrova rozhodnutí napříč 9 iteracemi designu (květen 2026) + redesign srpen 2026 (`../specs/web-redesign/STAV.md`).

> **POZOR: běží redesign (T0825-7).** Design pravidla níže popisují NOVÝ systém.
> Produkce nese starý design (béžová + EB Garamond) až do nasazení celého webu
> najednou. Historie starého systému je v changelogu dole.

---

## 1. Pozicování

### Cílovka
- **Ne-tech SMB CEO do ~250 lidí v ČR**, bez vlastního IT vedení.
- Mají infrastrukturu (servery, aplikace, dodavatelé), ale nemají IT manažera.
- 50+ let, často brýle na blízko.
- **Nesnášejí IT žargon.** ITáci je v minulosti často shazovali nebo z nich dělali blbce.
- Web cíleně mluví srozumitelně a věcně.

### Pozice (korekce Petra 25. 8. 2026)
Nejsme IT manager, který spravuje počítače -- jsme **technologický lídr, který
vede digitální transformaci firmy**. Stránka vedení IT prodává vedení a směr,
doklady (měsíční zápis, kontrola dodavatelů) jsou důkaz, ne argument.
Vzor: `sluzba-vedeni-it.html` v prototypech. "Digitální transformace" je tu
povolená jako pojmenování služby (title, hero) -- v běžném prodejním textu
zůstává na indexu buzzwordů.

### Whitespace v segmentu
Konkurenční landscape (květen 2026):
- **Tech-focused fractional CTO** (Šebela, Záruba, Gach, Mohr) — cílí startupy a scale-upy.
- **Krizový interim management** (Šimůnek, GQ Interim) — cílí korporace.
- **IT outsourcing/správa** (Mi-JaNET, ExterníIT, Váš IT konzultant) — cílí servery a sítě.
- **Manta IT** = pozice **"advisory pro ne-tech SMB CEO"** — žádný konkurent to neobsazuje přímo.

### Benchmark
`fractional.cz` (Nuc + Vodolan, CMO/CSO ne CTO). Stejný businessový model, stejná cílovka B2B SMB, stejná "bez bullshitu" tonalita, jen jiná disciplína. Co od něj převzít: kalkulačka úspor, struktura case studies, 5-krokový proces.

### Brand voice
- **Přímočarý.** Žádné okliky.
- **Sebevědomý.** Říkám co umím, ne co bych snad mohl umět.
- **Bez buzzwordů.** Žádná "digitální transformace", "synergie", "best practices", "win-win".
- **Bez humoru lidového typu** (Baťa cvičky atd.) — profesionál, ne kamarád z hospody.
- **Bez agrese.** "Převezmu řízení" ano, "převezmu zodpovědnost" ne (lživé).

### Claim
Aktuální claim (od 2026-07-24): **"Vy řídíte firmu. Já vaše IT."**
Starý claim "Konzultanti doporučují. Já přebírám řízení." ZRUŠEN plošně (i outreach) --
vymezoval se vůči konkurenci. Nikde nevracet. Druhé pravidlo: žádné "ručím/ručení/odpovědnost"
jako slib v copy (implikuje právní garanci). Historie: redesign v2 (2026-07-16) vypustil
z webu i "IT má firmu posouvat. Ne zaměstnávat vedení." (ta smí zůstat v llms.txt).

---

## 2. Copywriting pravidla

### Místo žargonu používej (slovník)
| ❌ Nepoužívat | ✅ Místo toho |
|---|---|
| scope | rozsah |
| vendor management | řízení dodavatelů |
| change management | řízení změn |
| risk management | řízení rizik |
| on-site | u vás |
| stack | technologie |
| backend / frontend | (vyhnout se) |
| CMS | jednoduchá správa obsahu |
| middleware | propojovací aplikace |
| retainer | paušál |
| roadmapa | plán rozvoje / harmonogram |
| adopce nástroje | zavádění nástroje |
| onboarding | zavádění (klientů) |
| ticketing | evidence požadavků |
| resource management | plánování kapacit |
| reporting | pravidelný přehled / hlášení o stavu |
| ROI | návratnost |
| discovery (v textu) | průzkum / mapování zadání |
| naučit někoho s něčím | zaškolit někoho v něčem |
| naceníme / doceníme | nezaměňovat (doceníme = uznáme hodnotu, naceníme = dáme cenu) |
| Lighthouse-ready | rychlý a kvalitní web |

### Výjimky — brand názvy zachovat
- AI plán do 48 hodin, AI zaměstnanec
- Web Standard, Web Quick
- IT governance (Petr o tom rozhodl, je to název hlavní služby)
- Product Discovery a Product Ownership (název dílčí služby)
- Raynet, Pohoda, Excel, Outlook, Jira (vlastní jména)
- Project Manager, Product Owner, Head of IT (skutečné názvy minulých pozic v referencích)

### CTA katalog (sjednocené formulace)
- **Primary CTA** (vede na kontakt): **"Napište mi"** (od 25. 8. 2026; nahradilo
  "Domluvit schůzku" z doby Calendly -- to už se nevrací).
- **Sekundární CTA** (vede na detail page): "Detail" / "Více informací"
- **Dvě CTA se stejným cílem v jedné liště nikdy** (proto v menu není položka
  Kontakt vedle tlačítka "Napište mi").
- **NIKDY:** "Objednat ..." u služeb, které vedou na hovor, ne na objednávku
  (falešný slib).

### Gramatické pasti
- "vedení" (n.) → shoda neutrum: "vedení vědělo, nevidělo" (ne "věděla, neviděla")
- "data" (n. pl.) → "data tečou sama" (ne "samy")
- "jako svoji práci" (4. pád akuzativ ž.) — ne "svojí"
- "nemění" (ne "nezměňuje")
- "aby se nikdo nedíval" (chybí zvratné se)

### Tonalita testy
Před commitem si přečti nahlas. Pokud zní jako:
- **agentura** ("revoluční", "premium", "best-in-class") → přepiš
- **konzultant** ("strategický návrh", "value proposition") → přepiš
- **kamarád z hospody** ("švihnu vám", "fakt cool") → přepiš
- **úředník** ("v rámci procesu", "zajištění implementace") → přepiš
- **Petr** (věcný, sebevědomý, lidský, bez bullshitu) → OK

---

## 3. Design pravidla

### Proč tenhle jazyk stavby

Skilly `design-taste-frontend` a `emil-design-eng` jmenovitě označují dva prvky
starého webu jako AI tells: **serif jako signál prémiovosti** (EB Garamond)
a **krémovo-béžovou paletu s tlumeným akcentem**. Nový systém jde proti oběma.

### Color tokens (redesign, srpen 2026)
```css
--papir:   #FBFBF9;  /* pozadí */
--inkoust: #101413;  /* text, tmavé sekce */
--zelena:  #0B6E4F;  /* JEDINÝ akcent na stránce */
--vada:    #9A3F2B;  /* výhradně data, která varují; nikdy dekorace, nikdy CTA */
```
Pět spektrálních odstínů (`#12A06B #12908F #3F6FC4 #B0762A #B4553C`) patří
výhradně kanálům hranolu na stránce AI zaměstnance, mimo ni se nepoužívají --
jinak se z jednoho akcentu stane duha. *(Paleta schválena Petrem 25. 8. 2026.)*

### Typografie
- **Outfit** display (nadpisy), **Manrope** text, **JetBrains Mono** JEN pro
  strojová data (štítky, časy, čísla, zdroje) -- nikdy na prodejní text,
  z webu by dělal terminál. Žádný serif.
- Body text min. 15 px, drobné popisky min. 12 px, tap targets >= 44 px.
- Kontrast: WCAG AA (4.5:1) minimum všude, AAA ideál (cílovka 50+).
  Poznámky pod čarou, které nesou výhradu, min. ~58 % inkoustu na papíru.

### Poloměry -- hierarchie, ne jedna hodnota
`--r-s` 8 px (štítky, ikony), `--r` 10 px (tlačítka, pole), `--r-l` 14 px
(velké panely). Jedna hodnota na všem byl vyzkoušený a zamítnutý extrém:
uniformita není systém. Výjimky jen fyzické objekty (desky, papír).

### Pohyb (podle Emila Kowalského)
- Jedna křivka: `cubic-bezier(.23,1,.32,1)`.
- Stisk do 160 ms, hover 180-250 ms, stagger po 60 ms.
- Hover vždy v `@media (hover:hover) and (pointer:fine)` -- na dotyku by zůstal zaseknutý.
- **Výchozí stav v CSS je vždy koncový**; zavřený nasazuje skript. Odkrývá
  sdílená `odkryj()` v `sluzba.js` s tvrdým časovačem 5 s (samotný
  IntersectionObserver v uspané záložce nikdy nepromluví).
- Žádná dorůstající čísla (klišé; nabíhat smí jen diagram, který ukazuje počet).
- Žádné node diagramy (Petr zakázal jmenovitě).
- Animace jen s účelem (skill `animate` má rozhodovací bránu); nekonečná
  smyčka jen tam, kde by zastavení lhalo (hranol = běžící služba).

### Skladba sekcí
- Každá sekce jiná skladba -- žádné tři stejné karty vedle sebe (AI tell).
- Nikde dvě tmavé sekce po sobě (slily by se v jeden blok).
- Interakce > pasivní scroll: aspoň jedno místo, kde návštěvník něco přepne
  (self-check zákona, hover legendy sta čtverečků, kanály hranolu).

### Ilustrace
SVG kreslené generátorem (`prototypy/obrazky/generuj.py`), jeden mechanismus
pro celou sadu: blok (systém/dokument), linka (cesta), kruh (rozhodnutí).
Test soudržnosti: každý tvar musí jít pojmenovat slovem z naší práce; co
nejde, patří pryč. Kreslit s vědomím nejmenšího místa použití -- linky 1,5 px
při zmenšení 4x zmizí. Změna palety = přegenerovat celou sadu, ne kreslit ručně.

---

## 4. Struktura nabídky

### Pět služeb (redesign, srpen 2026)

| Služba | Cena | Vlastní blok stránky |
|---|---|---|
| Vedení IT (digitální transformace) | od 50 000 Kč měsíčně | čtyři doklady každý měsíc; VZOR pro ostatní |
| Aplikace a systémy na míru | od 50 000 Kč, pevná cena za rozsah | antikampaň na starý model vývoje |
| Propojení a automatizace | podle rozsahu | okruh čtyř systémů, dvojice dnes -> potom |
| Bezpečnost a nový zákon | podle rozsahu | self-check zákona (Ano/Ne/Nevím) |
| AI zaměstnanec | 89 000 Kč, provoz od 8 000 Kč měsíčně | hranol; protiklad proti chatbotu |

Ceník na homepage navíc: AI plán do 48 hodin 9 900 Kč; dílčí zakázky
10 000 Kč/den; web 16 900 / 8 900 Kč; dotace na klíč 30 000 Kč (končí podáním).

Pět stránek sdílí kostru (`sluzba.css`/`sluzba.js`), ale prostředek se liší --
pět stránek se stejnou skladbou a vyměněnými slovy by četlo jako generované.
Sekce "kdy vám to nedoporučím" je na všech pěti. Staré cesty `reseni-ai`,
`reseni-naklady`, `reseni-nastroje`, `reseni-projekt`, `reseni-web` v nové
struktuře zanikají (řádky v ceníku) -- o přesměrování zatím nerozhodnuto.

Kategorie služeb z T0821-3 (Consulting/Advisory, Enterprise Architecture...)
jsou devíza pod hlavičkou interim IT governance, NE menu webu -- je to žargon
dodavatele. Na webu jsou jako sliby v první osobě.

---

## 5. SEO a GEO

### Canonical URL pravidlo
Musí přesně odpovídat URL v `sitemap.xml`. Od 2026-07-16 všechny **bez přípony `.html`** (např. `/reseni-ai`; ne trailing slash) -- soubory na disku příponu mají, Cloudflare Pages extensionless URL obslouží. Při změně sitemap změnit i canonical.

### llms.txt
Soubor v root webu (`/llms.txt`). Anthropic + Perplexity ho oficiálně podporují (květen 2026). Google explicitně ne, ale cena je nulová.

Aktualizovat při změně:
- Cen služeb
- Názvů služeb
- Hlavních claimů

### robots.txt
Allow všech AI crawlerů explicitně:
- GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, anthropic-ai, CCBot

### JSON-LD schémata per page
- `o-mne.html`: Person s knowsAbout, alumniOf
- `reseni-ai.html`: Service (AI plán do 48 hodin) + Offer (9 900 Kč)
- `reseni-*.html` ostatní: Service bez Offer (cena není pevná)
- nové detaily služeb: FAQPage se generuje samo z viditelných otázek (`sluzba.js`)
- `weby.html`: Service × 2 + FAQPage
- `raynet.html`: Service + FAQPage
- `kontakt.html`: ContactPage + ContactPoint
- `index.html` (rozcestník) a `ukazka-reportu.html`: zatím bez schématu

### Open Graph kompletní sada
Každá stránka musí mít:
- `og:title`
- `og:description`
- `og:type` (website / profile / etc.)
- `og:locale` = `cs_CZ`
- `og:url` (full URL)
- `og:site_name` = "Manta IT"
- `og:image` (1200×630) — `og-image.png` existuje (2026-07-16, generovaná z existujícího loga; po výběru finálního loga přegenerovat)
- `twitter:card` = `summary_large_image`
- `twitter:title`, `twitter:description`

### Definition-first hero
Backlinko + Firebrand 2026 standard pro GEO: první věta v hero musí jednou větou říct co je to. LLM ji citují jako odpověď.

Příklad: "Manta IT — externí IT vedení pro firmy bez vlastního IT ředitele."

### NEDĚLAT (z SEO/GEO agenta)
- Hidden metadata trying to game SEO
- Fake reviews
- Anglicismy v copy pro lepší keyword density (ničí cílovku)
- Soutěžit s Connectify/Dativery na "Raynet middleware" keyword (jsou tam etablovaní)

---

## 6. Reference a NDA pravidla

| Éra | Období | Co lze zveřejnit |
|---|---|---|
| Grandit IT | 2015-2022 | Jména projektů, loga, screenshoty (NDA expirované) |
| Blueghost | 2022-2025 | Pouze anonymně, NDA platí |
| Manta IT | 2026+ | Pod NDA — obecný popis, tag "Case study under NDA" |
| UltraConfig.cz (Ultra Marine) | 2025+ | **ZÁKAZ (Petr 7. 8. 2026): neuvádí se NIKDY, nikde** (přepisuje starší "NDA neplatí") |

Schválený seznam referencí (Petr 25. 8., uvádět všechny): Český rozhlas,
Radiotéka, Prima, Czech News Center, UniHobby, Pro-Doma, Almeco. Loga stažená
v `../specs/web-redesign/prototypy/loga/` (jednobarevné siluety, hover
rozsvítí). Formulace pásu: "Projekty, které jsem vedl".

### Aktuální TODO assets (čeká na Petra)
- Foto Petra (monogram PK je placeholder)
- PlanetLine logo + screenshot dispatching aplikace
- og:image — po schválení nové palety přegenerovat do nového designu

---

## 7. Rezervace schůzky -- proč formulář, ne widget

Calendly bylo z webu odstraněno ve dvou krocích: 7. 8. 2026 z indexu a kontaktu
(Petr: "vypadá noobsky"), 24. 8. 2026 ze zbylých 30 stránek včetně placené
landing page /reseni-ai. Plánované event types (Web Standard briefing, Raynet
konzultace a další) nevzniknou.

Všechna CTA vedou na kontakt (od 25. 8. znějí "Napište mi"). Důvody:
- Externí widget přidával blokující CSS a JS z cizí domény na každou stránku.
- Formulář posílá poptávku přes vlastní Worker a Gmail API, konverze se měří
  na `/dekujeme`. Rezervace přes Calendly se neměřila stejně spolehlivě.
- Návštěvník nemusí vybírat termín dřív, než ví, co chce řešit.

Redesign to řeší: kontakt se třemi cestami (napíšu co řeším / zavolejte mi /
pošlete mi termin) je přímo na homepage. Výběr termínu bez kalendáře: tři
kliky, dnešek se nikdy nenabízí. Pozvánky do kalendáře čekají na T0825-36.

---

## 8. Workflow při změnách

### Drobná změna (text, drobný styling)
1. Edit přímo na master.
2. Před commitem: ASCII grep, console errors, mobile viewport check.
3. Commit + push.

### Větší změna (nová sekce, restruktura)
1. Diskuse s Petrem (brainstorming).
2. Pokud strukturální → spec do `web/docs/superpowers/specs/` (volitelné).
3. Implementace na branch.
4. Verifikace přes Playwright (desktop + mobile screenshots).
5. Code review subagentem (po velkých změnách).
6. Merge do master po Petrově OK.

### Před deploymentem
1. Lighthouse audit (Chrome DevTools) → 90+ na všech 4 metrikách
2. Test CTA "Napište mi" -> kontakt -> odeslání -> /dekujeme
3. Test mailto linků
4. ASCII grep + ortografická kontrola
5. Sdílet link 1 důvěrnému kontaktu pro 10min review

---

## 9. Co se NEPOVAŽUJE za autoritativní

- Subagent reporty v `docs/research/` — jsou to data k diskuzi, ne příkazy. Petr rozhoduje.
- Tento dokument se může updatovat. Pokud najdeš novou Petrovu instrukci, která je v rozporu, zapracovat sem.

---

## Historie hlavních rozhodnutí (changelog)

- 2026-05-04: warm-professional redesign (beige + green, Cormorant + Inter)
- 2026-05-25: split z 1-page na 6-page strukturu
- 2026-05-25: IT governance povýšena na hlavní službu, dílčí zakázky pod ní
- 2026-05-25: AI Assessment / Lite + Web Standard / Quick + Raynet jako produktové balíčky s pevnou cenou
- 2026-05-26: ceny upraveny na baťovské (8 900 / 11 900 / 16 900 / 27 900)
- 2026-05-26: copywriting cleanup (Baťa cvičky pryč, falešné Objednat → Domluvit schůzku)
- 2026-05-26: 4 subagent research reports (UX, copy, SEO/GEO, competitor) — pravidla extrahována sem
- 2026-07-16: redesign v2 -- rozcestník (8 dlaždic) jako index.html + 9 detail stránek `reseni-*.html` + `ukazka-reportu.html` (anonymizovaný klientský případ); `ai.html` smazána, redirect `/ai` -> `/reseni-ai`
- 2026-07-16: AI Assessment (27 900) a AI Assessment Lite (11 900) nahrazeny službou "Mapa AI příležitostí" za 15 000 Kč (2x 1h workshop online)
- 2026-07-16: URL konvence bez přípony `.html` (canonical i sitemap); og-image.png vytvořena z existujícího loga
- 2026-07-16: sacred phrases vypuštěny z webu (v outreach parent workspace žije "Konzultanti doporučují..." dál)
- 2026-07-17: Mapa AI příležitostí zlevněna 15 000 -> 11 900 (rozhodnutí Petra)
- 2026-07-23: sekce "S plánem nezůstanete sami" na /reseni-ai (pokračování po Mapě: zavedení / řízení / plán je váš) -- dotažení pipeline na paid landingu
- 2026-07-24: Mapa AI 11 900 -> 9 900; nové sliby: plán do 48 hodin od druhého workshopu, případný AI agent/automatizace dodán Mantou do týdne (rozhodnutí Petra; rychlost jako diferenciátor)
- 2026-07-24: orientační cena AI agenta/automatizace z plánu zveřejněna: ~50 000 Kč (konzistentní s 10k/den x do týdne); poznámka v ukázce reportu (původní odhad 100k zachován, dnes dodávka za ~50k)
- 2026-07-24: služba přejmenována "Mapa AI příležitostí" -> **"AI plán do 48 hodin"** (rozhodnutí Petra; název = slib rychlosti). URL /reseni-ai a /ukazka-reportu beze změny, JSON-LD alternateName drží starý název. Metafora "mapa" nahrazena "plánem" i na ukázce.
- 2026-08-07: Calendly pryč z indexu a kontaktu ("vypadá noobsky"); 2026-08-24 ze zbylých 30 stránek. Nevrací se.
- 2026-08-22: web trojjazyčný (CZ/SK/EN, ceny v EUR), hub /clanky/, ceník a FAQ na indexu.
- 2026-08-25: redesign (T0825-7) -- nová paleta papír/inkoust/zelená, Outfit + Manrope + JetBrains Mono, 8 stránek v prototypech, CTA "Napište mi", pozice "vedení digitální transformace", pět služeb + AI zaměstnanec 89 000 Kč, dotace na klíč 30 000 Kč (pivot: služba končí podáním). Serif a béžová paleta ZRUŠENY jako AI tells. Nasazení celého webu najednou po schválení.
