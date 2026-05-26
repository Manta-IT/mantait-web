# TODO — Manta IT web

> Single source of truth pro vše, co je třeba udělat na webu Manta IT.
> Aktualizováno: 2026-05-26 (handoff po dlouhé práci 25.-26. května)
> Vlastník: Petr Kokoška + Claude Code
>
> Konvence: `[ ]` = TODO, `[~]` = částečně hotové, `[!]` = blokuje další postup, `[?]` = otevřená otázka
>
> Kategorie podle pilíře nebo modulu. V každé úloze: **co**, **proč**, **jak řešit / co je potřeba si ujasnit**, **vlastník** (Petr / Claude / oba).

---

## A. ROZJETÉ — pokračujeme dál (priorita 1)

### A.1 Brand identity & logo — pokračování Brand Lab v2

- [!] **Logo z Brand Lab v1 se nelíbí — Petr nevybral žádný z 5 konceptů**
  - **Co:** Spustit Brand Lab v2 s jinými směry. Stávající `brand-lab.html` (5 konceptů: Pixelated Factory, Smokestack Synapse, AI Cipher, Phase Transition, MANT·AI·T Wordmark) zůstává jako reference.
  - **Proč:** Bez loga není brand identity → bez brand identity nelze udělat email podpis, smlouvy, prezentace, LinkedIn cover. Logo blokuje celou kategorii B.
  - **Co je potřeba si ujasnit s Petrem:**
    - Co konkrétně se mu na v1 nelíbí? Symbol moc literální (továrna)? Typografie? Barvy? Proporce?
    - Líbí se mu některý koncept aspoň částečně (kombinace 3 + 5)?
    - Chce úplně jiný směr — abstract emblem / pure typography / hybrid badge / industrial modernist / tech glyph?
    - Jak důležitá je "továrna" doslovně vs metaforicky?
  - **Detail:** `web/docs/research/brand-design-brief.md` (kompletní brief + popis 5 konceptů + doporučený postup v2)
  - **Vlastník:** Petr (feedback) → Claude (spustit subagenta)

### A.2 Aplikovat zbývající fixy z UX agent reportu

UX subagent vrátil 10 priorit, **6 hotových**, **4 zbývají**:

- [ ] **Body text z 14px → 15-16px v kartách**
  - **Selektory:** `.pain-card-body`, `.service-desc`, `.subservice-desc`, `.product-card-desc`, `.specializace-desc`, `.usecase-desc`, `.ai-card-desc`, `.ref-case-body`, `.faq-answer`
  - **Proč:** Cílovka 50+ let s brýlemi. 14px je spodní hranice. Petr explicitně řekl "některé texty se blbě čtou".
  - **Jak:** Najít v `style.css`, font-size z 14px na 15px (16px ideálně). Test na 600px viewport.

- [ ] **Bullety v kartách 13px → 14-15px, ztmavit**
  - **Selektory:** `.service-bullets li`, `.subservice-bullets li`, `.ai-card-deliverable`, `.ref-item-desc`
  - **Stejný princip jako body text.**

- [ ] **11px labely → 12-13px, použít accent nebo text-muted místo text-faint**
  - **Selektory:** `.service-bullets-label`, `.subservice-bullets-label`, `.ai-card-deliverable-label`, `.contact-item-label`, `.ref-meta-k`, `.subservice-price-unit`
  - **Pravidlo z CLAUDE.md:** `--text-faint` NIKDY pro text.

- [ ] **Hero-reassure a contact-note přepsat: 15px Inter weight 500 text-muted, bez italic**
  - **Aktuální:** 13px text-faint italic Cormorant — nečitelné na blízko.
  - **Proč:** Petr explicit: "Některé jsou strašně prťavé. Vlášť ty tenký a co jsou šedivou barvou na bílém pozadí."

- [ ] **Odstranit italic Cormorant subtitle ze 4 karet**
  - **Selektory:** `.subservice-tagline`, `.product-card-subtitle`, `.ai-card-subtitle`, `.bio-photo-name`
  - **Pravidlo PRINCIPLES.md:** Italic CG jen jako akcent v nadpisech (em uvnitř h1/h2) nebo standalone quote. NIKDY jako subtitle pod kartami — čte se jako druhý titulek.
  - **Náhrada:** Inter italic 14px text-muted, nebo úplně odstranit.

- [ ] **Footer 12-13px text-faint → 14px text-muted; ztmavit `.footer-trust`**
  - **Trust signál nečitelný.**

- [ ] **`.bio-photo-name` plný `--text` (ne rgba 0.6)**
  - **Aktuální:** kontrast 3:1 FAIL.

- [ ] **Projít všechny `--text-faint` selektory v textu a nahradit za `--text-muted` nebo `--text-secondary`**
  - **15 míst dle code-review.md:** `.hero-reassure`, `.service-price small`, `.service-bullets-label`, `.subservice-row-price-unit`, `.subservices-cta-note`, `.retainer-format`, `.product-card-format`, `.ai-card-format`, `.ai-card-deliverable-label`, `.contact-item-label`, `.contact-note`, `.ref-meta-k`, footer (3×).
  - **Detail:** `web/docs/research/ux-review.md`

**Vlastník:** Claude

### A.3 Aplikovat zbývající fixy z Code Review agent reportu

Code reviewer vrátil 10 priorit. **5 hotových** (anchor #process→#proces, `<a>` wraps `<button>`, `<main>` landmark, `:focus-visible`, tap targets, mobile hamburger). **5 zbývá:**

- [ ] **Calendly CSS render-blocking na 5 z 6 stránek**
  - **Co:** `<link href="https://assets.calendly.com/.../widget.css">` v `<head>` všech 6 stránek. Aktivně je potřeba jen na `kontakt.html` (inline embed). Na ostatních 5 popup widget načte CSS dynamicky při triggeru.
  - **Akce:** Odstranit `<link>` z `index.html`, `o-mne.html`, `ai.html`, `weby.html`, `raynet.html`. Ponechat jen na `kontakt.html`.
  - **Proč:** Render-blocking external CSS = pomalejší LCP. Quick win.

- [ ] **`<a href="#" onclick="... return false;">` 13× → změnit na `<button>` s `data-calendly` atributem**
  - **Antipattern:** open dialog ≠ navigation. `<a href="#">` lže address baru, rozbíjí middle-click/open-in-new-tab, historicky fire `hashchange`.
  - **Hotovo:** Produktové karty na index.html (mají `data-calendly` na `<button>`).
  - **Zbývá:** Nav CTA "Domluvit schůzku" (6× across pages), hero CTA, contact CTA, AI fallback ("domluvte 30 minut hovoru zdarma"), ai-card CTAs (`button.ai-card-cta` se má change na čistý `<button data-calendly>`).
  - **Detail:** code-review.md priority #6

- [ ] **Calendly URL hardcoded 36× → extrahovat do JS data-attribute pattern**
  - **Aktuální:** Stejný URL s query stringem `?hide_gdpr_banner=1&background_color=...` v každém onclick. Petr bude muset upgrade na Calendly Pro → 5 nových event types → 30 edit search-and-replace.
  - **Akce:** Inline `<script>` na konci body (už máme `data-calendly` handler). Stačí převést všechny `Calendly.initPopupWidget({url:...})` calls na `<button data-calendly="...">` + share handler.

- [ ] **Dead CSS ~10% souboru — smazat**
  - **Selektory s 0 použití:** `.retainer-box`, `.retainer-inner`, `.retainer-name`, `.retainer-desc`, `.retainer-price`, `.retainer-format` (`style.css:940-983`), `.service-row`, `.service-name`, `.service-desc`, `.service-price` (`:587-655`), `.btn-secondary` (`:104-112`), `.container` (`:54-58`), `#services h2`, `#services h2 em` (`:555-577`), `#contact` (`:1539`), `[id^="quick"]` (`:38`), `.ai-teaser` (`:1965, :2069`).
  - **Akce:** Smazat. Šetří ~5 KB.

- [ ] **Italic Cormorant card subtitle removal** (duplicit s A.2 — done together)

- [ ] **FAQ → `<details><summary>` (native disclosure)**
  - **Aktuální:** `<div class="faq-item">` s always-visible answer. JSON-LD FAQPage ano, ale HTML to nereplikuje.
  - **Akce:** Změnit na `<details><summary>otázka</summary><div>answer</div></details>` na ai.html, weby.html, raynet.html. Plus globální CSS styling pro accordion. Zero JS, accessibility built-in, FAQ-rich-results consistent.

- [ ] **`<div id="governance">` chybí scroll-margin-top**
  - **Akce:** Buď přidat `.governance-box[id]` do `style.css:37-42` selectoru, nebo změnit markup na `<section class="governance-box" id="governance">`.

- [ ] **Hardcoded `#234436` (hover accent dark) 3× → token `--accent-dark`**
  - **Selektory:** `.btn:hover` (`:102`), `.nav-cta:hover` (`:241`), governance hover (`:1240`).
  - **Akce:** Přidat `--accent-dark: #234436` do `:root`, refactor 3 místa.

- [ ] **Preconnect chybí na weby.html a raynet.html**
  - **Akce:** Přidat `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` pro konzistenci.

- [ ] **Cormorant Garamond 8 axes — trim na 4-5 used**
  - **Aktuální:** `ital,wght@0,400;0,500;0,600;1,500;1,600` (5 axes Cormorant + 3 Inter).
  - **Akce:** Zkontrolovat, které weights se reálně používají. Trim. Šetří ~30-40 KB font assets.

- [ ] **Add `@media (prefers-reduced-motion: reduce)` pravidlo**
  - **Akce:** 5 řádků CSS na konec — disable transforms/transitions pro uživatele s motion sensitivity.

- [ ] **Dropdown menu accessibility (`.nav-dropdown`)**
  - **Aktuální:** `<a href="...">Specializace</a>` toggles na hover/focus-within. Při Enter na klávesnici navigates pryč místo otevření.
  - **Akce:** Změnit na `<button aria-expanded="false" aria-haspopup="menu">Specializace</button>` driving `<ul role="menu">`. Plus JS toggle aria-expanded.

**Vlastník:** Claude
**Detail:** `web/docs/research/code-review.md`

---

## B. ČEKÁ NA TVOJE PODKLADY — Petr musí dodat

### B.1 Foto Petra

- [!] **Reálná fotka Petra místo monogramu PK**
  - **Co:** Profesionální portrétní foto, ideálně:
    - 1× square ~800×800 pro o-mne.html bio sekce a Person.image schema
    - 1× 1200×630 (landscape) pro og:image asset
    - 1× 200×200 pro LinkedIn profile picture (po brand update)
  - **Akce:** Petr vyfotí (dodal v jednom z předchozích kol).
  - **Pak:** Claude swap `<div class="bio-photo">` content z monogramu PK na `<img>`. Update `Person.image` v JSON-LD na o-mne.html.

### B.2 og:image asset (1200×630)

- [!] **Branded og:image pro social share cards**
  - **Co:** PNG 1200×630, branded (logo + Petr photo + tagline "IT má firmu posouvat. Ne zaměstnávat vedení.").
  - **Proč:** `twitter:card="summary_large_image"` deklarováno všude, ale image chybí → LinkedIn/Facebook/WhatsApp shares renderují prázdné cards. Pro B2B brand kritické.
  - **Status:** Čeká na finalizaci loga (závisí na A.1).
  - **Akce po dodání:** Claude přidá `<meta property="og:image" content="https://mantait.cz/og-image.png">` + `og:image:width`, `og:image:height`, `og:image:alt` na všech 6 stránek. Plus twitter:image.
  - **Per-page own og:image** (lepší CTR) — později, jakmile bude celkový asset hotov.

### B.3 Reference loga + screenshots z CV projektů (Grandit IT éra)

- [ ] **NDA expirované u Grandit IT projektů (2015-2022)** — Petr může dodat jména + obrázky
  - **Projekty k vytěžení:**
    - Almeco.cz (proprietární B2B e-commerce platforma)
    - Pro-doma.cz (zakázkový e-shop)
    - Unihobby.cz (mobilní aplikace + věrnostní program)
    - Český rozhlas Radiotéka (audio platforma + e-shop)
    - Czech News Center (ikiosek.cz, digitální platforma)
    - Prima Nápady (hobby web)
    - Tympanum (custom e-shop)
    - Prima HbbTV (interaktivní TV vrstva)
  - **Co Petr dodá:** Pro každý projekt: logo (PNG/SVG), screenshot homepage, URL na live web (pokud běží), 1-2 věty o roli.
  - **Pak:** Claude přidá sekci "Klienti / Reference s logy" na o-mne.html. Vlastní stylingová sekce: logo wall (4-5 v řadě, šedo-bílá grayscale → barva na hover), pod tím detail cards s screenshoty.

### B.4 PlanetLine screenshot + popis

- [ ] **Screenshot dispatching aplikace + specifikace**
  - **Co Petr dodá:** Obrázek dispatching systému + dokumentaci, kterou Petr napsal jako Product Owner.
  - **Pak:** Claude přidá jako 3. case study na o-mne.html nebo posílí stávající PlanetLine případ s konkrétními bullety o tom, co Petr definoval.

### B.5 UltraConfig.cz case study + obrázky

- [ ] **NDA neplatí, Petr dodá detail**
  - **Co Petr dodá:** Obrázky aplikace (smart konfigurátor s maticí kompatibility, interaktivní webové nabídky, Raynet synchronizace UI), specifikace produktu, případně přihlášení Claude do prostředí pro screenshot.
  - **Pak:** Claude přidá kompletní case study na o-mne.html. Jeden z nejsilnějších kandidátů na show-case sekci (Raynet integrace + AI první-class). Plus reference na raynet.html (vlastní implementační case).

### B.6 Calendly Pro upgrade + 6 nových event types

- [!] **Calendly Pro je placený — Petr musí upgrade**
  - **Co Petr udělá:**
    1. Upgrade na Calendly Pro/Standard ($10-15/měs)
    2. Vytvoří 6 event types:
       - `30min orientační` (existující, generic)
       - `it-governance` (úvodní revize, 60 min)
       - `ai-assessment` (briefing 30 min)
       - `ai-assessment-lite` (briefing 30 min)
       - `web-standard` (briefing 30 min)
       - `web-quick` (briefing 30 min)
       - `raynet-konzultace` (úvod 30 min)
    3. Pošle Claude URL každého event type
  - **Pak:** Claude search-and-replace 7 míst v HTML kódu (TODO komentáře jsou tam u každého CTA).
  - **Důvod priorita:** Po sdílení webu friends/network bude Petr dostávat hovory smíchané dohromady — různé typy hovorů potřebují různé prep dotazníky (Calendly form fields per event type).

### B.7 Cloudflare hosting + doména mantait.cz

- [!] **Nasazení na Cloudflare Pages**
  - **Co Petr udělá:**
    1. Ověřit stav domény mantait.cz (registrátor, expirace, kontrola, MX records pro petr.kokoska@mantait.cz)
    2. Cloudflare Pages — nový projekt
    3. Připojit GitHub repo Manta-IT/web (nebo create new repo z web/ složky)
    4. Custom domain: mantait.cz → Cloudflare DNS records
    5. SSL/TLS Full strict
  - **Po nasazení:**
    - Test že všechny 6 stránek načítají (`/`, `/o-mne.html`, `/ai.html`, `/weby.html`, `/raynet.html`, `/kontakt.html`)
    - Test že `robots.txt`, `sitemap.xml`, `llms.txt` jsou dostupné na rootu
    - Submit `https://mantait.cz/sitemap.xml` do Google Search Console + Seznam Webmaster Tools
  - **Detail:** Cloudflare Pages auto-deploy z `master` branch.

---

## C. SEO + GEO optimalizace (z SEO agent reportu)

10 priorit z SEO agenta. **5 hotových** (canonical fix, llms.txt, robots.txt AI crawlers, og:locale + twitter:card kompletní sada, JSON-LD per page). **5 zbývá:**

- [ ] **og:image vytvořit a referencovat** (duplicit s B.2)

- [ ] **FAQPage schema na index.html a o-mne.html**
  - **Aktuální:** FAQPage JSON-LD je na ai.html, weby.html, raynet.html. Chybí na index.html a o-mne.html.
  - **Akce index.html:** Přidat 5 nejčastějších otázek a odpovědí (např.: Jaké jsou ceny? Pro koho je IT governance? Jak začneme? Geografie? Kolik trvá spolupráce?).
  - **Akce o-mne.html:** 3-5 otázek (např.: Co jsem dělal? Kolik let praxe? Jaké jsou reference? Jak se mám oslovit?).
  - **Proč:** FAQPage = nejvyšší LLM yield pro citace v ChatGPT/Claude/Perplexity. Plus Google Rich snippets.

- [ ] **Definition-first hero opening na podstrankách**
  - **Aktuální:** raynet.html, weby.html, ai.html mají pohádkové hero ("Skoro se vším kolem Raynetu"). Pro GEO 2026 standard chybí jasná definice první větou.
  - **Akce:** Před hero quote/headline přidat 1 větu definicí. Příklad raynet.html: "Raynet CRM zavádím, propojuji s účetnictvím a školím obchodníky pro malé a střední firmy v ČR." Hned za tím stávající headline.
  - **Proč:** Studie ukazují 34 denních LLM citací pro definition-first openings vs <5 u narrativních.

- [ ] **Organization/Person `sameAs` schema**
  - **Akce index.html:** Přidat `"sameAs": ["https://www.linkedin.com/in/pekok0/", "https://github.com/Manta-IT"]` do ProfessionalService.founder Person schema.
  - **Akce o-mne.html:** Stejně do hlavního Person schema.
  - **Proč:** Entity linking pro LLM cross-reference.

- [ ] **`Person.image` placeholder fix** (duplicit s B.1)

- [ ] **BreadcrumbList schema na index.html** (pro konzistenci, i když root)

- [ ] **Per-page unique og:image** (později, po B.2)

- [ ] **`openingHours` a `geo` souradnice v ContactPage schema** (kontakt.html)
  - **Akce:** Add `"openingHours": "Mo-Fr 09:00-18:00"` + `"geo": {"@type": "GeoCoordinates", "latitude": 50.0755, "longitude": 14.4378}` (Praha).

- [ ] **`Article` / `CaseStudy` schema na raynet.html case study sekci**

- [ ] **Service `serviceType` field** na weby.html a raynet.html JSON-LD (minor)

**Detail:** `web/docs/research/seo-research.md` (sekce 5 Konkrétní doporučení per soubor)

### C.X SEO externí registrace (Petr má dělat manuálně)

- [ ] **Firmy.cz zápis** (Seznam.cz autoritativní lokální search)
  - **Akce Petr:** Registrovat zdarma na `firmy.cz`. Kategorie: "IT poradenství", "Webdesign", "AI poradenství". Plus profil s logem + popisem.
  - **Proč:** Seznam.cz drží ~20% CZ search marketu. Firmy.cz je hlavní lokální signál.

- [ ] **Google Business Profile** (zdarma)
  - **Akce Petr:** Vytvořit GBP pro Manta IT. Kategorie: "Business management consultant". Plus telefon, email, web, hodiny.
  - **Proč:** Pro Google Maps lokální search + brand authority signal.

- [ ] **LinkedIn Company page**
  - **Akce Petr:** Vytvořit Manta IT company page (vedle osobního profilu). Logo (po finalizaci A.1), cover image, popis.

- [ ] **Submit sitemap.xml do Google Search Console + Seznam Webmaster Tools**
  - **Po nasazení na Cloudflare (B.7).**

---

## D. NOVÉ STRÁNKY (čekají na obsah / brand)

### D.1 pro-agentury.html — landing pro outreach na agentury

- [ ] **Vlastní stránka pro B2B outreach na agentury/vývojářská studia/dodavatele SW**
  - **Co:** Standalone landing. Hlavní message: "Máte problémového klienta? Pošlete mě tam. Pomůžu vést z druhé strany, neutrálně, NDA-friendly. Vaše projekty se stabilizují, klient je spokojený, vy získáváte další zakázky."
  - **Proč:** Petr chce outreach na agentury — když napíše mail, potřebuje vlastní URL kterou pošle (ne generic mantait.cz). Neposílá je na obecný web, kde skončí na homepage a neví co dál.
  - **Co je potřeba si ujasnit:**
    - Pozicování win-win-win: vaše projekty + váš klient + Manta IT
    - Příklady situací (rozjetý projekt, eskalace u klienta, klient požaduje něco co agentura nedělá)
    - Cena/forma spolupráce (rev share? introduction fee? čistě referral?)
    - Co Manta IT NEZkušuje (přebrat klienta, vyvíjet konkurenční sofware) — disclaimer
  - **Vlastník:** Petr (definice obsahu) → Claude (implementace stránky)

### D.2 Brand assets po finalizaci loga (závisí na A.1)

Až bude vybrané finální logo, vyrobit:

- [ ] **Email podpis (HTML + plain text)**
  - **Proč:** Petr to vůbec nemá. Když posílá maily klientům, je tam jen jeho jméno.
  - **Co obsahuje:** Logo, jméno, role ("Externí IT ředitel / Manta IT"), telefon, email, web, LinkedIn URL, případně Calendly link.
  - **2 verze:** HTML (pro Gmail/Outlook moderne) a plain (pro mobil/text klienty).
- [ ] **Smlouva template** (rámcová smlouva o dílo)
- [ ] **Nabídka template** (cenová nabídka po Discovery hovoru)
- [ ] **Objednávka template**
- [ ] **Prezentace template** (PowerPoint/Keynote/Google Slides — title slide, content slide, contact slide)
- [ ] **PDF templates** pro AI Assessment Lite report + AI Assessment plán
- [ ] **Favicon kompletní:**
  - SVG (existující) + ICO + PNG 192×192 + PNG 512×512 (PWA manifest)
  - Update všech 6 HTML stránek s `<link rel="icon">` na novou ikonku
- [ ] **LinkedIn cover image + profile picture update**
- [ ] **Brand guidelines dokument** (1-page PDF)
  - Paleta s hex kódy + Pantone + CMYK
  - Typografie (Cormorant Garamond / Inter, weight/size hierarchy)
  - Logo varianty + clear-space pravidla
  - Don'ts (zakázané kombinace, deformace)

**Vlastník:** Claude (po výběru loga)

---

## E. OBSAHOVÉ / POZIČNÍ ZLEPŠENÍ (z Competitor agent reportu)

Top 10 doporučení z konkurenčního výzkumu, **řazeno dopad × snadnost:**

- [ ] **1. Sekce "Klienti / Kde jsem působil" na o-mne.html**
  - **Proč:** #1 chybějící prvek vs Záruba (12 log), Šimůnek, GQ Interim. Sociální důkaz = největší rozdíl.
  - **Akce:** I 3-5 log nebo názvů ze starých angažmá (Grandit IT éra). Závisí na B.3 (Petr dodá podklady).

- [ ] **2. 2-3 case studies "Situace → co jsem udělal → výsledek"**
  - **Aktuální:** Na o-mne.html jsou 3 case studies (Audio platforma + MHA + PlanetLine), ale ne detailní 4-step format.
  - **Akce:** Rozšířit existující na: Situace, Co jsem dělal/dělám, Výsledek/Aktuální stav, Co z toho má klient. Optionalně mini-screenshot/diagram.
  - **Benchmark:** Fractional.cz má 5 case studies, my máme 3 — OK rozsah.

- [ ] **3. Pravidelný newsletter nebo podcast** (long-term, ne kritická pro launch)
  - **Co:** Měsíční newsletter o IT governance pro non-tech CEO (1 case study + 1 tip).
  - **Proč:** Šimůnek má podcast #RestartSystému — žádný jiný hráč v segmentu nemá content. Manta IT může zaplnit.
  - **Akce:** Vybrat platformu (Substack? Beehiiv?). Spustit sub-domain `news.mantait.cz` nebo embedded sign-up na webu.

- [ ] **4. Kalkulačka "Externí IT ředitel vs zaměstnanec"**
  - **Proč:** Fractional.cz to dělá pro CMO. CEO ne-tech SMB rozhoduje mezi (a) najmout zaměstnance, (b) konzultanta, (c) nedělat nic. Kalkulačka 50k/měs vs 150k+ full-time CTO + benefits + recruit fee + onboarding 3 měsíce + risk fluctuation je silný conversion tool.
  - **Akce:** Vlastní stránka `/kalkulacka.html` nebo widget na index.html. Jednoduchý HTML form s JS calculation. Inputs: měsíční rozpočet, počet IT projektů ročně, počet dodavatelů. Output: kolik ušetříte ročně + payback time.

- [ ] **5. Hodinová sazba pro mikro zakázky**
  - **Aktuální:** "Individuálně dle rozsahu" pro IT revize. Žádná hodinová sazba.
  - **Akce:** Přidat "Ad-hoc konzultace 3 000 Kč/h" jako fallback entry point. Pro malé úkoly (1 telefon, 1 review smlouvy).
  - **Benchmark:** Tomáš Mohr má 3 000 Kč/h transparentně.

- [ ] **6. Rozšířit specializace o 2-3 platformy vedle Raynet**
  - **Možnosti:** ABRA Flexi, Money S5, Pohoda integrace, HubSpot, Microsoft 365 pro firmy.
  - **Akce po výběru:** Vlastní stránky podobně jako raynet.html.
  - **Pozor:** Až bude jasné, kde Petr má reálně hloubku. Specializace bez praxe = anti-trust signal.

- [ ] **7. "Jak poznám že potřebuji externího IT ředitele" sebe-test/quiz**
  - **Co:** 5-7 otázek s yes/no. Příklady:
    - Máte víc než 3 IT dodavatele?
    - Řeší majitel IT 2+ hodiny týdně?
    - Měli jste projekt, který přesáhl rozpočet o víc než 30%?
    - Máte pravidelný IT reporting majiteli?
    - Víte, kolik vás stojí provoz IT ročně?
  - **Akce:** Vlastní stránka `/test.html` nebo widget. Lead magnet + diagnostika. Na konci CTA "Domluvit schůzku".

- [ ] **8. Druhý web pro long-tail SEO (Šebela trick)**
  - **Možnost:** `externiitreditel.cz` přesměrovaný na mantait.cz, nebo s mírně jiným pozičním rámcem.
  - **Akce:** Registrovat doménu, nastavit redirect.

- [ ] **9. Vlastní /blog/ s 1 článkem/2 týdny** (long-term)
  - **Témata:** Konkrétní situace ("Jak jsem revidoval 7 IT dodavatelů u stavební firmy"), governance tipy, AI use cases.
  - **Akce:** Po launchu webu na Cloudflare. Markdown-based static blog (např. použít Eleventy/Astro pro generování z `.md` souborů — ale projekt explicitně bez build steps, tak HTML přímo).

- [ ] **10. English fallback page**
  - **Pro:** Multinational klienty s českou pobočkou (CFO/COO v Praze sedí často Američan/Brit).
  - **Akce:** `/en/` directory s anglickou verzí kritických stránek (index + o-mne + kontakt).

**Detail:** `web/docs/research/competitor-research.md`

---

## F. COPYWRITING — zbývající fixy

Copy subagent vrátil 20 priorit. **Top 10 aplikováno** (Baťa cvičky, gramatika, falešné CTA "Objednat", retainer→paušál, middleware→propojovací aplikace). **Zbývá z top 20:**

- [ ] **CTA "Detail" na product cards → "Více informací" / "O službě"**
  - **Aktuální:** "Detail" je neutrální, slabé.
  - **Akce:** Změnit v index.html karty.

- [ ] **Konzistence "30 minut" reassurance** napříč sekcemi (3 různé varianty)
  - **Aktuální různé varianty:**
    - "30 minut. Online nebo u vás. Bez závazku." (index hero)
    - "30 minut online, bez závazku." (kontakt, ai)
    - "30 minut. Bez závazku. Pochopím vaši situaci." (index kontakt CTA, o-mne)
    - "30 minut online nebo u vás, bez závazku." (weby, raynet)
  - **Akce:** Sjednotit. Doporučení: "30 minut. Online nebo u vás. Bez závazku." (umožňuje obojí, věcné).

- [ ] **Konzistence "Odpověď do 24 hodin"**
  - **Footer:** "Odpověď do 24 hodin"
  - **Kontakt page:** "Odpovídám do 24 hodin"
  - **Akce:** Sjednotit na "Odpovím do 24 hodin" (osobní, ne pasivní).

- [ ] **`weby.html:264`: srovnání s agenturami "80-200 tis."** — zjemnit
  - **Aktuální:** "Klasická agentura by vám za stejný web fakturovala 80 000 - 200 000 Kč."
  - **Návrh:** "U klasické agentury byste za podobný web zaplatili 80 000 – 200 000 Kč. Já dodám rychleji a levněji díky AI."
  - **Proč:** Méně agresivní vůči konkurenci (CZ SMB cílovka může vnímat negativně).

- [ ] **`ai.html:122`: "případy užití s reálným ROI"** → "s reálnou návratností"
  - **Proč:** "ROI" = anglicismus, cílovka (SMB majitelé) ho obvykle nezná.

- [ ] **`o-mne.html:225`: "Resource management"** → "Plánování kapacit"
  - **Plus:** "ticketingu (Jira)" → "evidence požadavků (Jira)", "onboardingu klientů" → "zavádění nových klientů"

- [ ] **`o-mne.html:316`: "Discovery dokončené, technický návrh schválený. Spouštíme implementační fázi."**
  - **Návrh:** "Průzkum dokončený, technický návrh schválený. Spouštíme realizaci."

- [ ] **`o-mne.html:235, 276`: "Adopce AI nástrojů"** → "Zavádění AI nástrojů"

- [ ] **`index.html:502`: "produktizované balíčky"** → "hotové balíčky s pevnou cenou"
  - **Proč:** "Produktizované" = marketing žargon, cílovka mu nemusí rozumět.

- [ ] **`o-mne.html:175`: "hobby market" 2× → "hobbymarket" (1 slovo)**

- [ ] **`o-mne.html:146`: "Detail rád proberu osobně"** → "Detaily rád proberu osobně" (plurál)

- [ ] **Drobné stylistické**: "Klient na detail nestíhal" → "Klient nestíhal hlídat detaily" (chybí předmět)

**Detail:** `web/docs/research/copywriting-review.md` (uložit z transcriptu — viz F.X níže)

### F.X Uložit copywriting agent report do souboru

- [ ] **Vytvořit `web/docs/research/copywriting-review.md`**
  - **Aktuálně:** Report je jen v transcriptu této session (subagent ho neuložil kvůli vlastním constraint).
  - **Akce:** Extrahovat z transcriptu a uložit pro budoucí reference (až bude příští iterace copywriting cleanup).

---

## G. CHYBĚJÍCÍ FUNKCE (z konverzace + Petrova feedback)

- [ ] **Web Standard a Web Quick — onboarding klienta workflow**
  - **Petr říkal:** "Budeme si vytvářet boilerplate s dotazníky. Klient mám vyplní. Nebo skrýpneme jeho stávající web. Budeme mít info, budeme mít boilerplate, a budeme schopní díky frontend-design generovat weby automaticky."
  - **Akce:** Po prvních klientech navrhnout proces: form pro klienta (firma, sektor, sortiment, kontakty, foto, social), agentní pipeline pro generování webu.

- [ ] **AI Quick Check / Assessment — deliverable templates**
  - **Co:** PDF template pro AI Quick Check report (4-6 stran) + AI Assessment plán.
  - **Akce:** Až Petr odbaví první klienty, vyrobit template ze skutečných dodávek.

- [ ] **Kontaktní formulář s spam protection?**
  - **Aktuální:** Jen Calendly embed + email/telefon na kontakt.html.
  - **Otázka:** Chce Petr i form (Formspree / Netlify Forms)?

---

## H. NÁPADY DO BUDOUCNA (parking lot)

Z konverzace, neuptional, později:

- [ ] **Druhý LinkedIn profil "Manta IT" jako company page** + Petr postuje z osobního i company
- [ ] **Postavit LinkedIn outreach pipeline** s šablonami zpráv pro osobní kontakty Petra
- [ ] **Kontaktovat staré známé z Petrova telefonu/networkingu** s nabídkou — Petr říkal "potřebuju nutně klienty, MHA může kdykoliv skončit"
- [ ] **Email outreach na agentury** (po dokončení D.1 pro-agentury.html)
- [ ] **Případně přejít z mantait.cz na .com** pokud rozšířit do EU? Otevřené (cena domény, branding shift)
- [ ] **Analytics / měření konverze** — Plausible / Cloudflare Web Analytics (cookieless, GDPR-friendly)
- [ ] **Cookies banner** — nepotřebujeme dokud nemáme analytics

---

## I. INFRASTRUKTURA / DEVOPS

- [!] **Git repo + CI/CD** (po nasazení na Cloudflare)
  - **Akce:**
    1. Push web/ jako vlastní repo `Manta-IT/web` na GitHub
    2. Cloudflare Pages connect to GitHub
    3. Auto-deploy on push to master
    4. Pre-commit hook: ASCII grep check, simple HTML validate

- [ ] **Lighthouse audit automatizovaný v CI**
  - **Po nasazení.** Cíl: 90+ na všech 4 metrikách. GitHub Actions s Lighthouse CI.

---

## STAV SESSION 2026-05-25 / 2026-05-26 — co bylo hotovo

**Web struktura:**
- 6 HTML stránek (index, o-mne, ai, weby, raynet, kontakt) + sdílený style.css
- llms.txt, robots.txt s AI crawlers, sitemap.xml
- JSON-LD per page (ProfessionalService, Person, Service×N, FAQPage, ContactPage)
- Per-page kompletní og + twitter + canonical meta tags
- Mobile nav s CSS-only hamburger toggle
- `<main>` landmark + `:focus-visible` + tap targets ≥ 44px

**Obsahová struktura:**
- 5 pain karet (propojení/automatizace → reporting → nový systém → adopce → rozjetý projekt)
- IT governance jako hlavní služba (tmavý hero blok, od 50k/měs)
- 4 dílčí zakázky jako rows s hover-to-dark-gold (Projektové řízení, Product Discovery+PO, Zavádění nástrojů, IT revize)
- Produktové služby ve 2 řadách: AI (Assessment 27 900 / Lite 11 900), Weby (Standard 16 900 / Quick 8 900)
- Specializace sekce s Raynet kartou + dropdown menu
- 3 case studies (Ultra Marine done, PlanetLine, MHA in-progress)
- Sekce "Jak to probíhá" na home (5 kroků + NDA), ai, raynet, weby
- Brand Lab v1 s 5 logo koncepty (Petr nevybral, čeká v2)

**Dokumentace:**
- `CLAUDE.md` (autoritativní behavior rules pro Claude Code)
- `PRINCIPLES.md` (detailní bible designu/copy/SEO/pozicování + changelog)
- `docs/research/` (5 subagent reportů: seo-research, competitor-research, code-review, ux-review extrakt, brand-design-brief)

**Co Petr potvrdil jako "dobrá práce" v session:**
- 4-paralelní subagent pattern (SEO + competitor + UX + copywriting)
- Code-reviewer subagent s laťkou "ne vibe-coded spaghetti"
- IT governance reframe jako hlavní služba
- Dílčí zakázky hover effect
- Mobile nav hamburger

---

## OTEVŘENÉ OTÁZKY (čekají na rozhodnutí Petra)

- [?] **Slogan — "Management through AI" finalní?** (verze "Management True AI" byla original, Petr opravil na "through")
- [?] **AI Assessment Lite cena** — Petr řekl 8 900 → opravil na 11 900. Stabilizováno?
- [?] **Web Standard cena 16 900** — Petr potvrdil. Stabilizováno.
- [?] **Hodinová sazba** pro ad-hoc — kolik? 3 000 Kč/h podle Mohra?
- [?] **Newsletter platforma** — Substack, Beehiiv, vlastní?
- [?] **Pro-agentury.html win-win-win** — jaká forma spolupráce (rev share? referral?)?
- [?] **Specializace rozšíření** — kde má Petr reálně hloubku (Pohoda? Abra? Money?)
- [?] **Email podpis stack** — Gmail signature editor? Wisestamp? Vlastní HTML?
- [?] **Cloudflare Pages vs Vercel** — Petr říkal Cloudflare. Stabilizováno.

---

*Vlastník TODO.md: Petr Kokoška. Update Claude při dalších iteracích.*
