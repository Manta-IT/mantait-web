# Codex Instructions Mirror

This `AGENTS.md` was created for Codex from the adjacent `CLAUDE.md`.
Treat the original content below as project guidance. When it names Claude Code-only tools, hooks, skills, commands, or agent APIs, map them to the closest Codex-native capability when available; otherwise treat them as historical context, not a required tool call.

Always read nearby `STATUS.md`, `CONTEXT.md`, and `INDEX.md` when present; those files are shared project context across harnesses.

Role-specific sections from the original `CLAUDE.md` (for example Collective CEO mode, PM mode, or handoff-only workflows) apply only when the user explicitly invokes that role or workflow. In ordinary Codex sessions, stay in Codex coding-agent mode and execute requested work directly.

---

# Original `CLAUDE.md`
# CLAUDE.md — web

Pravidla pro Claude Code při práci na webu Manta IT. Drž se. Detail je v `PRINCIPLES.md`.

## Co to je
6stránkový statický web pro Manta IT (značka Petra Kokošky). Žádný build step, žádný framework.
- `index.html` — Hero, pain, IT governance, dílčí služby, průběh, produktové služby, specializace, differentiator, kontakt
- `o-mne.html` — Bio + reference + case studies
- `ai.html` — AI Assessment a AI Assessment Lite
- `weby.html` — Web Standard a Web Quick
- `raynet.html` — Specializace na Raynet CRM
- `kontakt.html` — Calendly embed + kontakty
- `style.css` — sdílený stylesheet (vždy editovat tady, nikdy inline)

## Workflow
1. Editace `.html` přímo. CSS jen v `style.css`.
2. Preview: `python -m http.server 8773` v adresáři `web/` → `http://localhost:8773/`.
3. Žádný build, žádný lint, žádný framework.
4. Před každým commitem: projít každou ze 6 stránek desktop (1280px) + 600px viewport, console errors check, ASCII grep clean.

## Deployment

**Auto-deploy přes Cloudflare Pages z `master` branch.**
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

`scripts/bump-cache.py` updatuje `<link href="style.css?v=XXX">` ve všech 6 HTML na aktuální git short hash. **Pust před každým commit který mění style.css.**

## Závazná pravidla (porušení = chyba)

### Copywriting
- **Sacred phrase** "Konzultanti doporučují. Já přebírám řízení." nikdy neměnit.
- **ASCII-only.** Žádné em-dash (—), smart quotes („" ‚'), ellipsis (…). Renderuje se rozbitě. Používej regular `-`, `"`, `'`, `...`.
- **Bez IT žargonu v body copy.** Cílovka jsou ne-tech SMB majitelé (50+ let, brýle na blízko). Výjimka jen pro brand názvy služeb: AI Assessment, AI Assessment Lite, Web Standard, Web Quick, Raynet, Pohoda, IT governance.
- **Domluvit schůzku** jako primární CTA. Ne "hovor", ne "konzultace", ne "objednat" (falešný slib pro 30min hovor).
- **Žádný humor typu Baťa cvičky.** Profesionální tón.
- **Místo žargonu používej:** paušál (ne retainer), propojovací aplikace (ne middleware), zaškolím (ne naučím s), zavádění (ne adopce), pravidelný přehled (ne reporting), průzkum / mapování zadání (ne discovery v textu — Product Discovery jako název služby OK).

### Design
- **`--text-faint #5d6a66` NIKDY jako text na světlém pozadí** (kontrast 3.2:1, fail WCAG). Použij `--text-muted` nebo `--text-secondary`.
- **Body text minimum 15px**, ideál 16px. Drobné labely nikdy pod 12px.
- **Italic Cormorant** jen jako akcent v `<em>` v nadpisech (h1/h2) a jako standalone pull-quote. NIKDY jako subtitle pod kartami (čte se jako druhý titulek).
- **Tap targets ≥ 44px** výška na CTA tlačítkách (Petr požaduje mobile UX).
- **Vizuální rytmus pozadí:** `--bg` → `--bg-alt` → `--bg` → `--bg-alt` → `--bg-dark` → `--bg-alt` → footer. Tmavá sekce primárně pro IT governance + differentiator.
- **Cormorant Garamond** display (nadpisy, akcenty). **Inter** body/nav/CTA. Žádné třetí fonty.
- **Breakpointy:** 600px (mobile), 900px (tablet), 1100px (nav collapse).

### Struktura nabídky (nepřehazovat bez Petra)
- **IT governance** = hlavní služba, od 50 000 Kč měsíčně (paušál). Pokrývá všech 5 pain pointů. Dlouhodobý retainer.
- **Dílčí zakázky** (10 000 Kč/den): Projektové řízení, Product Discovery a Product Ownership, Zavádění a adopce nástrojů, IT revize (individuálně).
- **Produktové služby** (pevná cena):
  - AI Assessment 27 900 Kč (2 dny u klienta)
  - AI Assessment Lite 11 900 Kč (4h online)
  - Web Standard 16 900 Kč (do 2 týdnů)
  - Web Quick 8 900 Kč (do týdne)
- **Specializace:** Raynet (od 15 000 Kč).

### SEO / GEO
- `<link rel="canonical">` musí přesně odpovídat URL v sitemap.xml (oba `.html`, ne mix).
- `robots.txt` allow GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai, CCBot.
- `llms.txt` v root webu — udržuj aktuální, hlavně ceny a názvy služeb.
- Per-page meta: `og:title`, `og:description`, `og:type`, `og:locale=cs_CZ`, `og:url`, `og:site_name`, `twitter:card=summary_large_image`, canonical.
- JSON-LD: každá page má alespoň jedno relevantní schema (ProfessionalService/Person/Service/FAQPage).

### Změny obsahu
- **Reference (Grandit IT éra 2015-2022)**: NDA expirované, jména projektů + loga + screenshoty OK (čeká na podklady od Petra).
- **Reference (Blueghost éra 2022-2025)**: NDA platí, anonymně.
- **Reference (Manta IT — MHA, PlanetLine, Ultra Marine)**: pod NDA, obecný popis + tag "Case study under NDA". UltraConfig.cz NDA neplatí.
- **Calendly**: aktuálně všechny CTA vedou na obecný 30min event (`https://calendly.com/petr-kokoska-mantait/30min`). Po Calendly Pro upgrade Petr vytvoří event types pro AI Assessment / AI Assessment Lite / Web Standard / Web Quick / IT governance — pak nahradit (TODO komentáře v HTML).

## Kontext a souvislosti
- **Parent workspace:** `../` (`ventures/manta-it/`) — branding, lead gen, market research.
- **Reports/research:** `web/docs/research/` (seo-research.md, competitor-research.md). Čti při strategických úvahách.
- **Detail pravidel:** `web/PRINCIPLES.md` (design + copywriting + SEO bible).
- **Stav a TODO:** `web/STATUS.md`.

## Před commitem checklist
1. ASCII grep: `grep -P '[\x{2010}-\x{2015}\x{2018}-\x{201F}\x{2026}]' web/*.html` → 0 hitů
2. Console errors: otevřít každou stránku v Chrome, DevTools → 0 errors
3. Mobile: viewport 600px, žádný horizontal scroll, čitelné texty
4. Calendly CTA: kliknout, popup se otevře v warm-professional palette
5. Nav active state: na každé stránce zvýrazněna ta aktuální položka
6. Anchor scroll: kotvy s `scroll-margin-top: 84px` neskáčou pod nav

## Co NEDĚLAT
- Nevkládat inline CSS do HTML (vše do `style.css`).
- Nepřidávat JS framework. Vanilla nebo nic.
- Nevolat externí JS kromě Calendly + Google Fonts.
- Negenerovat fake reviews ani fake reference.
- Nezvyšovat ceny bez Petrova explicitního pokynu.
- Nepoužívat `--text-faint` jako barvu textu.
- Nepřepisovat "Domluvit schůzku" na "Objednat" / "Konzultaci".
- Nevkládat hidden metadata, hidden SEO triky.
- Nepřidávat anglicismy do body copy.
