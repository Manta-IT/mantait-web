# CLAUDE.md — web

Pravidla pro Claude Code při práci na webu Manta IT. Drž se. Detail je v `PRINCIPLES.md`.

## Co to je
15stránkový statický web pro Manta IT (značka Petra Kokošky). Žádný build step, žádný framework.
- `index.html` -- rozcestník: 8 dlaždic "co řešíte" ve 3 vrstvách + skrytá devátá cesta
- `reseni-*.html` (9x) -- detail stránky jednotlivých cest (ai, nova-aplikace, propojeni, nastroje, projekt, naklady, bezpecnost, web, vedeni-it)
- `ukazka-reportu.html` -- ukázkový report z Mapy AI příležitostí (anonymizovaný klientský případ)
- `o-mne.html` — Bio + reference + case studies
- `weby.html` — Web Standard a Web Quick
- `raynet.html` — Specializace na Raynet CRM
- `kontakt.html` — kontaktní formulář (POST /api/kontakt, Worker odesílá přes Gmail API) + kontakty. Calendly ODSTRANĚNO: 2026-08-07 z indexu a kontaktu (Petr: "vypadá noobsky"), 2026-08-24 ze zbylých 30 stránek. Všechna CTA "Domluvit schůzku" nyní vedou na `/kontakt`.
- `dotace-mas.html` — landing kampaně "Dotace na klíč pro digitalizaci" (OP TAK Technologie pro MAS II) s formulářem způsobilosti; obsah řídí mission control v parent workspace (`../deliverables/2026-08-07_dotacni-tazeni-mission-control.html`)
- `clanky/` — obsahový hub (jen CZ): `manifest.json` = zdroj dat, `_template.html` = šablona, index + homepage highlights generuje `scripts/gen_clanky_index.py` (publikační checklist v `specs/blog/README.md`)
- `sk/`, `en/` — jazykové mutace (19 stránek, ceny v EUR, dotační obsah vynechán); KAŽDÁ obsahová změna CZ stránky se promítá i sem (pravidla v `docs/dt13-spec.md`)
- `style.css` — sdílený stylesheet (vždy editovat tady, nikdy inline)
- `_redirects` -- Cloudflare redirecty (`/ai` -> `/reseni-ai`); stará `ai.html` smazána 2026-07-16

## Workflow
1. Editace `.html` přímo. CSS jen v `style.css`.
2. Preview: `python scripts/serve.py` v adresáři `web/` → `http://localhost:8773/` (umí extensionless URL jako Cloudflare Pages).
3. Žádný build, žádný lint, žádný framework.
4. Před každým commitem: projít každou z 15 stránek desktop (1280px) + 600px viewport, console errors check, ASCII grep clean.

## Deployment

**Auto-deploy přes Cloudflare Workers Builds z `master` branch** (Worker `mantait-web`, worker.js = statické assety + POST /api/dotaznik a /api/kontakt přes Gmail API; ověřeno 22. 8. 2026 — dřívější zmínky o "Pages" byly nepřesné).
- Repo: `https://github.com/Manta-IT/mantait-web`
- Push do `master` = automatický deploy do produkce (Cloudflare má vlastní pipeline napojenou na repo)
- Doména: `mantait.cz` (DNS spravovaná na Cloudflare)
- Build: žádný (static HTML/CSS)
- **NESPOUŠTĚT wrangler manuálně** — Cloudflare Pages to dělá samo z GitHubu

**Workflow:**
```bash
# Po klonu repa - jednou:
sh scripts/install-hooks.sh

# Pak normalni commit (pre-commit hook auto-bumpne ?v=hash):
git add -A
git commit -m "fix: ..."
git push origin master      # Cloudflare auto-deploy
```

Bez pre-commit hook (fallback):
```bash
python scripts/bump-cache.py    # manualni bump pred commitem
git add -A
git commit -m "fix: ..."
git push origin master
```

## Cache strategy

- **HTML stránky**: max-age=300 (5 min, must-revalidate) — drobné copy fixy se dostanou rychle
- **style.css**: max-age=1 rok + immutable — browser nikdy nezhodnotí, hash v query (`?v=573b155`) ho donutí stáhnout novou verzi
- **sitemap.xml**: max-age=3600 (1h)
- Cloudflare CDN edge cache se auto-purgne při každém deployi (cca 30s globálně)

`scripts/bump-cache.py` updatuje `<link href="style.css?v=XXX">` ve všech HTML v rootu webu na aktuální git short hash. **Pust před každým commit který mění style.css.**

## Závazná pravidla (porušení = chyba)

### Copywriting
- **ASCII-only v typografii.** Žádné em-dash (—), smart quotes („" ‚'), ellipsis (…). Renderuje se rozbitě. Používej regular `-`, `"`, `'`, `...`. Česká diakritika se ale ZACHOVÁVÁ.
- **Bez IT žargonu v body copy.** Cílovka jsou ne-tech SMB majitelé (50+ let, brýle na blízko). Výjimka jen pro brand názvy služeb: AI plán do 48 hodin (dřív "Mapa AI příležitostí"), Web Standard, Web Quick, Raynet, Pohoda, IT governance.
- **Domluvit schůzku** jako primární CTA. Ne "hovor", ne "konzultace", ne "objednat" (falešný slib pro 30min hovor).
- **Žádný humor typu Baťa cvičky.** Profesionální tón.
- **Místo žargonu používej:** paušál (ne retainer), propojovací aplikace (ne middleware), zaškolím (ne naučím s), zavádění (ne adopce), pravidelný přehled (ne reporting), průzkum / mapování zadání (ne discovery v textu — Product Discovery jako název služby OK).

### Design
- **`--text-faint #5d6a66` NIKDY jako text na světlém pozadí** (kontrast 3.2:1, fail WCAG). Použij `--text-muted` nebo `--text-secondary`.
- **Body text minimum 15px**, ideál 16px. Drobné labely nikdy pod 12px.
- **Italic EB Garamond** jen jako akcent v `<em>` v nadpisech (h1/h2) a jako standalone pull-quote. NIKDY jako subtitle pod kartami (čte se jako druhý titulek).
- **Tap targets ≥ 44px** výška na CTA tlačítkách (Petr požaduje mobile UX).
- **Vizuální rytmus pozadí:** `--bg` → `--bg-alt` → `--bg` → `--bg-alt` → `--bg-dark` → `--bg-alt` → footer. Tmavá sekce primárně pro IT governance + differentiator.
- **EB Garamond** display (nadpisy, akcenty). **Inter** body/nav/CTA. Žádné třetí fonty.
- **Breakpointy:** 600px (mobile), 900px (tablet), 1100px (nav collapse).

### Struktura nabídky (nepřehazovat bez Petra)
- **IT governance** = hlavní služba, od 50 000 Kč měsíčně (paušál). Pokrývá všech 5 pain pointů. Dlouhodobý retainer.
- **Dílčí zakázky** (10 000 Kč/den): Projektové řízení, Product Discovery a Product Ownership, Zavádění a adopce nástrojů, IT revize (individuálně).
- **Produktové služby** (pevná cena):
  - AI plán do 48 hodin 9 900 Kč (2x 1h workshop online, plán do 48 hodin od druhého workshopu; případný AI agent/automatizace dodán Mantou do týdne za orientačně 50 000 Kč (ostatní kroky 10 000 Kč/den); přejmenováno z "Mapa AI příležitostí" + sníženo z 11 900 rozhodnutím Petra 2026-07-24, předtím z 15 000 dne 2026-07-17)
  - Web Standard 16 900 Kč (do 2 týdnů)
  - Web Quick 8 900 Kč (do týdne)
- **Specializace:** Raynet (od 15 000 Kč).

### SEO / GEO
- `<link rel="canonical">` musí přesně odpovídat URL v sitemap.xml (oba **bez přípony `.html`**, např. `/reseni-ai`; soubory na disku příponu mají, Cloudflare Pages extensionless URL řeší sám).
- `robots.txt` allow GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai, CCBot.
- `llms.txt` v root webu — udržuj aktuální, hlavně ceny a názvy služeb.
- Per-page meta: `og:title`, `og:description`, `og:type`, `og:locale=cs_CZ`, `og:url`, `og:site_name`, `twitter:card=summary_large_image`, canonical.
- JSON-LD: každá page má alespoň jedno relevantní schema (ProfessionalService/Person/Service/FAQPage).

### Změny obsahu
- **Reference (Grandit IT éra 2015-2022)**: NDA expirované, jména projektů + loga + screenshoty OK (čeká na podklady od Petra).
- **Reference (Blueghost éra 2022-2025)**: NDA platí, anonymně.
- **Reference (Manta IT — MHA, PlanetLine)**: pod NDA, obecný popis + tag "Case study under NDA". MHA jen anonymně ("B2B distribuční firma") dokud Petr nedodá text NDA.
- **ZÁKAZ (Petr 2026-08-07): Ultra Marine, UltraConfig.cz a VŠECHNY projekty spojené s Ultramarínem se NIKDY neuvádějí** — na webu, v CV, nikde. Detail v memory `feedback-ultramarin-nikdy-reference`. (Přepisuje starší pravidlo "UltraConfig.cz NDA neplatí".)
- **Rezervace schůzky**: Calendly je z webu pryč (24. 8. 2026) a nevrací se — všechna CTA vedou na `/kontakt`, kde formulář posílá poptávku přes Worker a Gmail API. Konverze se měří na `/dekujeme`. Nezavádět externí rezervační widget bez Petrova pokynu.

## Kontext a souvislosti
- **Parent workspace:** `../` (`ventures/manta-it/`) — branding, lead gen, market research.
- **Reports/research:** `web/docs/research/` (seo-research.md, competitor-research.md). Čti při strategických úvahách.
- **Detail pravidel:** `web/PRINCIPLES.md` (design + copywriting + SEO bible).
- **Stav a TODO:** `web/STATUS.md`.

## Před commitem checklist
1. ASCII grep: `grep -P '[\x{2010}-\x{2015}\x{2018}-\x{201F}\x{2026}]' web/*.html` → 0 hitů
2. Console errors: otevřít každou stránku v Chrome, DevTools → 0 errors
3. Mobile: viewport 600px, žádný horizontal scroll, čitelné texty
4. CTA "Domluvit schůzku": klik vede na `/kontakt`, formulář odešle a přesměruje na `/dekujeme`
5. Nav active state: na každé stránce zvýrazněna ta aktuální položka
6. Anchor scroll: kotvy s `scroll-margin-top: 84px` neskáčou pod nav

## Co NEDĚLAT
- Nevkládat inline CSS do HTML (vše do `style.css`).
- Nepřidávat JS framework. Vanilla nebo nic.
- Nevolat externí JS kromě Google Fonts, Google Ads (gtag) a Cloudflare Web Analytics.
- Negenerovat fake reviews ani fake reference.
- Nezvyšovat ceny bez Petrova explicitního pokynu.
- Nepoužívat `--text-faint` jako barvu textu.
- Nepřepisovat "Domluvit schůzku" na "Objednat" / "Konzultaci".
- Nevkládat hidden metadata, hidden SEO triky.
- Nepřidávat anglicismy do body copy.
