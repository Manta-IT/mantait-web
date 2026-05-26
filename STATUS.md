# Manta IT Web — STATUS

> Aktualizováno: 2026-05-26 (po 8-paralel fanout subagentů, brand v3 in progress)
> Vlastník: Petr Kokoška + Claude Code

## Stav
**LIVE V PRODUKCI** | Priorita: MEDIUM | Poslední deploy: 2026-05-26

Web nasazen na **mantait.cz** přes Cloudflare Pages auto-deploy z master branch (commit b5006b7). Po 2 kolech fanout subagentů (8+6 paralelních agentů) + Petr review + 12 cílených fixů. Logo zatím odloženo (brand-lab v1-v6 vygenerovány, žádný nevybrán) — gitignored.

## Deployment
- **GitHub**: https://github.com/Manta-IT/mantait-web
- **Auto-deploy**: push to master → Cloudflare Pages → mantait.cz (1-2 min)
- **Manual deploy**: NEPOUŽÍVAT wrangler. Vše přes git push.

## Pending (po launch)
- **Logo finalizace** — brand-lab v1-v6 jako research, žádný nevybrán. Petr odložil, vrátíme se později.
- **Foto Petra** — square 800×800 + landscape 1200×630
- **og:image asset** (čeká na logo)
- **Calendly Pro** — Petr může upgrade + vytvořit 6 event types per service
- **External registrace**: Firmy.cz, Google Business Profile, LinkedIn Company page Manta IT
- **Submit sitemap**: Google Search Console + Seznam Webmaster Tools

## Co je hotové (this session)

### Web struktura
- 6 stránek (index, o-mne, ai, weby, raynet, kontakt) + sdílený style.css
- llms.txt, robots.txt s AI crawlers, sitemap.xml
- JSON-LD per page (ProfessionalService, Person, Service×N, FAQPage, ContactPage)
- Kompletní og + twitter + canonical na všech 6 stránkách
- Mobile nav s CSS-only hamburger toggle
- `<main>` landmark + `:focus-visible` + tap targets ≥ 44px

### Obsah
- 5 pain karet s novým pořadím (propojení/automatizace → náklady/reporting → nový systém → adopce → rozjetý projekt)
- IT governance jako hlavní služba (tmavý hero box, od 50k/měs paušál)
- 4 dílčí zakázky jako rows s hover-to-dark-gold efektem
- Produktové služby (AI 27 900 / Lite 11 900, Web Standard 16 900 / Quick 8 900)
- Specializace sekce s Raynet kartou + dropdown menu
- 3 case studies (Ultra Marine, PlanetLine, MHA)
- "Jak to probíhá" sekce na home (5 kroků + NDA), ai, raynet, weby

### Dokumentace
- `CLAUDE.md` (autoritativní behavior rules pro Claude Code)
- `PRINCIPLES.md` (detailní bible designu/copy/SEO/pozicování)
- `TODO.md` (single source of truth pro vše co zbývá)
- `docs/research/` (5 subagent reportů: SEO, competitor, code-review, UX, copywriting, brand-design-brief)

### 4 paralelní subagent runs
- SEO/GEO research → 10 priorit, 5 aplikováno
- Competitor research → top 10 doporučení (sociální důkaz, kalkulačka, podcast)
- UX/accessibility review → 10 priorit, 6 aplikováno
- Copywriting review → top 20, top 10 aplikováno
- Code review → 10 priorit, 5 aplikováno
- Frontend design (logo Brand Lab v1) → 5 konceptů, Petr žádný nevybral

## Action list (high-level — detail v TODO.md)

### Petr musí dodat
- [ ] Foto Petra (square 800×800 + landscape 1200×630)
- [ ] Feedback na Brand Lab v1 (co se nelíbí, kam jít v2)
- [ ] Loga + screenshoty Grandit-éra projektů (Almeco, Pro-doma, Unihobby, Radiotéka, ikiosek, Prima, Tympanum)
- [ ] PlanetLine screenshot + specifikace
- [ ] UltraConfig.cz obrázky + specifikace (NDA neplatí)
- [ ] Calendly Pro upgrade + 6 nových event types URL
- [ ] Cloudflare Pages setup + doména mantait.cz

### Claude udělá
- [ ] Brand Lab v2 (po Petrově feedbacku)
- [ ] Aplikovat zbývající fixy z 4 subagent reportů (cca 20 položek)
- [ ] Email podpis + brand assets (po výběru loga)
- [ ] pro-agentury.html landing
- [ ] Sekce "Klienti / Reference s logy" na o-mne.html (po B.3)

### Sociální + content (long-term)
- [ ] LinkedIn Company page Manta IT
- [ ] Firmy.cz zápis
- [ ] Google Business Profile
- [ ] Pravidelný newsletter / podcast (po launchi)

## Lokální preview
```bash
python -m http.server 8773 --directory C:/AI/ventures/manta-it/web
# http://localhost:8773/
```

## Souvislosti
- **Parent workspace:** `ventures/manta-it/` (branding, lead gen, market research)
- **Single source of truth:** `web/TODO.md` (vše co zbývá)
- **Pravidla:** `web/CLAUDE.md` (rules) + `web/PRINCIPLES.md` (bible)
- **Research history:** `web/docs/research/` (5 reportů + brand brief)
- **Outreach:** Po launchi Petr osloví network z telefonu/LinkedIn

## Konflikty
Žádné aktivní konflikty zdrojů.

Předchozí verze STATUS.md (z 5. května) byly historické — aktuální stav je v rozsáhlé restruktuře a redesignu z 25.-26. května.
