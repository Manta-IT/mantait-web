# Manta IT web — principy

Detailní bible designu, copywritingu, pozicování a SEO. Pro lidi i pro Claude Code.
Pro tlustá pravidla viz `CLAUDE.md`. Tento dokument vysvětluje **proč**.

Zdroje: 4 subagent reporty (UX, copywriting, SEO/GEO, competitor) + Petrova rozhodnutí napříč 9 iteracemi designu (květen 2026).

---

## 1. Pozicování

### Cílovka
- **Ne-tech SMB CEO 50-300 lidí v ČR**, bez vlastního IT vedení.
- Mají infrastrukturu (servery, aplikace, dodavatelé), ale nemají IT manažera.
- 50+ let, často brýle na blízko.
- **Nesnášejí IT žargon.** ITáci je v minulosti často shazovali nebo z nich dělali blbce.
- Web cíleně mluví srozumitelně a věcně.

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

### Sacred phrases (historie)
Redesign v2 (2026-07-16) obě fráze z webu vypustil:
- "Konzultanti doporučují. Já přebírám řízení." -- v outreach (parent workspace) platí dál, na web nevracet bez Petrova pokynu.
- "IT má firmu posouvat. Ne zaměstnávat vedení."

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
- Mapa AI příležitostí
- Web Standard, Web Quick
- IT governance (Petr o tom rozhodl, je to název hlavní služby)
- Product Discovery a Product Ownership (název dílčí služby)
- Raynet, Pohoda, Excel, Outlook, Jira (vlastní jména)
- Project Manager, Product Owner, Head of IT (skutečné názvy minulých pozic v referencích)

### CTA katalog (sjednocené formulace)
- **Primary CTA** (vede na Calendly): "Domluvit schůzku"
- **Sekundární CTA** (vede na detail page): "Detail" / "Více informací"
- **Reassurance pod CTA:** "30 minut. Online nebo u vás. Bez závazku."
- **Headlines kontaktních sekcí:** "Začněme rozhovorem."
- **NIKDY:** "Objednat AI Assessment" (vede na 30min hovor, ne na objednávku — falešný slib).

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

### Color tokens
```css
--bg:               #f1ede4;  /* main beige */
--bg-alt:           #ebe5d6;  /* darker beige for rhythm */
--bg-card:          #f8f5ec;  /* card background */
--bg-dark:          #16201d;  /* IT governance, differentiator */

--accent:           #2d5447;  /* deep green */
--accent-warm:      #c9b88a;  /* warm gold for dark sections */

--text:             #16201d;  /* primary text */
--text-muted:       #2e3835;  /* secondary text — POUŽÍVAT */
--text-secondary:   #3a4744;  /* alternative for 13-14px texts */
--text-faint:       #5d6a66;  /* JEN PRO HAIRLINES / DECORATIVE, NIKDY PRO TEXT */

--text-on-dark:        #f1ede4;
--text-on-dark-muted:  rgba(241,237,228,0.75);
--text-on-dark-faint:  rgba(241,237,228,0.65);  /* zvýšeno z 0.5 kvůli kontrastu */

--border:           #e0dccf;
--border-strong:    #d8d1bf;
```

### Color contrast pravidla
- Body text musí mít WCAG AA (4.5:1) minimum, AAA (7:1) ideál (cílovka 50+).
- `--text-muted` na `--bg`: 7.5:1 ✓
- `--text-faint` na `--bg`: 3.2:1 FAIL → nepoužívat pro text
- `--accent` na `--bg`: 6.7:1 ✓ (OK pro CTA, nadpisy)
- `--accent-warm` na `--bg-dark`: 8.6:1 ✓
- `bio-photo-name` (text na monogramu): plný `--text`, ne rgba

### Font sizes
| Element | Minimum | Doporučeno |
|---|---|---|
| Body (paragrafy v kartách) | 15px | 16px |
| Bullety v kartách | 14px | 15px |
| Labely (UPPERCASE eyebrow) | 12px | 12-13px |
| Footer texty | 14px | 14px |
| Nav links | 14px | 14px |
| Nav CTA | 14px | 14px |
| Tap target height | 44px | 44-48px |

### Italic Cormorant — kdy ano, kdy ne
**ANO:**
- `<em>` uvnitř h1, h2 nadpisů (accent slovo)
- Standalone pull-quotes (velké, 22px+, centered)
- Process tagline ("Žádná teorie bez realizace.")

**NE:**
- Subtitle pod jménem karty (čte se jako druhý titulek)
- Tagline pod ikonou (vypadá jako podnadpis)
- Text na barevném pozadí (bio-photo-name)
- Texty pod 15px (italic + malé = nečitelné)

### Vizuální rytmus pozadí
Sekce by se měly střídat: `--bg` → `--bg-alt` → `--bg` → `--bg-alt` → `--bg-dark` → `--bg-alt` → footer.

Tmavé sekce (`--bg-dark`) primárně pro **emocionální moment**:
- IT governance hlavní služba (homepage)
- "Proč to není konzultant" (differentiator)
- Hover stav sub-services (translation z light do dark)

---

## 4. Struktura nabídky

### Pyramid pricing (od nejdražšího po nejlevnější)

```
1. IT governance (paušál od 50 000 Kč/měsíc)
   └─ pokrývá všech 5 pain pointů + obsahuje v sobě všechny dílčí služby
   
2. Dílčí zakázky (10 000 Kč/den, nebo individuálně)
   ├─ Projektové řízení
   ├─ Product Discovery a Product Ownership
   ├─ Zavádění a adopce nástrojů
   └─ IT revize (individuálně)
   
3. Produktové služby (pevná cena)
   ├─ Mapa AI příležitostí 15 000 Kč (2x 1h workshop online, výstup report)
   ├─ Web Standard 16 900 Kč (do 2 týdnů)
   └─ Web Quick 8 900 Kč (do týdne)
   
4. Specializace (od 15 000 Kč)
   └─ Raynet CRM
```

### Selling point dlouhodobosti
**Klíčová zpráva v IT governance:** "Pokud máte více než jeden problém z těch výše, dejte si rovnou paušál. Vyjde to levněji a nezůstanete bez nikoho, až se vynoří další věc."

Aktuální copy v `index.html` v `.governance-desc` toto vyjadřuje. Při změně kopírovat tuto logiku.

### Pain points → Služby mapping
| # | Pain | Hlavní řešení |
|---|---|---|
| 01 | Propojení systémů a automatizace procesů | Product Discovery a Product Ownership / IT governance |
| 02 | Náklady rostou, chybí přehled a reporting | IT revize / IT governance |
| 03 | Nový systém nebo aplikace bez jasného zadání | Product Discovery a Product Ownership |
| 04 | Lidé špatně používají, co máte | Zavádění a adopce nástrojů |
| 05 | Rozjetý projekt, který se vymyká | Projektové řízení |

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
- `reseni-ai.html`: Service (Mapa AI příležitostí) + Offer (15 000 Kč)
- `reseni-*.html` ostatní (8x): Service bez Offer (cena není pevná)
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
| UltraConfig.cz (Ultra Marine) | 2025+ | NDA neplatí, plně možno detail + obrázky |

### Aktuální TODO assets (čeká na Petra)
- Foto Petra (monogram PK je placeholder)
- Loga + screenshoty Grandit-éra projektů (Almeco, Pro-doma, Unihobby, Radiotéka, ikiosek, Prima Nápady, Tympanum)
- PlanetLine logo + screenshot dispatching aplikace
- UltraConfig.cz obrázky + specifikace (Petr přihlásí Claude do prostředí)
- og:image asset — hotovo 2026-07-16 z existujícího loga (`og-image.png`); po výběru finálního loga z Brand Labu přegenerovat

---

## 7. Calendly event types (TODO)

Aktuálně všechny CTA vedou na obecný 30min event. Po Calendly Pro upgrade Petr vytvoří:
- 30min orientační (existující)
- Mapa AI příležitostí briefing
- Web Standard briefing
- Web Quick briefing
- IT governance úvodní revize
- Raynet konzultace

V HTML jsou TODO komentáře u všech CTA pro nahrazení URL.

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
2. Test Calendly popup na všech stránkách
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
