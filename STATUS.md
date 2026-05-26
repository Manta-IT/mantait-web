# Manta IT Web — STATUS

> Aktualizováno: 2026-05-26 (po 8-paralel fanout subagentů, brand v3 in progress)
> Vlastník: Petr Kokoška + Claude Code

## Stav
**fixy-aplikovany-cekam-na-brand** | Priorita: HIGH | Poslední velká změna: 2026-05-26

Po 8-paralel fanout: aplikováno cca 90% TODO z A.2 (UX), A.3 (code review), C (SEO), F (copy). Brand v2 dodal 6 konceptů — Petr nevybral, jdeme do v3 (matrix 4 textury x 4 směry "AI požírá tradiční fabriku"). Deployment ČEKÁ na Petrův web review + výběr loga.

## Blocker
- **Logo** — v1 (5 konceptů) ani v2 (6 konceptů) nevyhovuje. v3 generuje subagent matrix: PCB / synapse / mesh / hybrid x zleva/zprava/shora/diffuze = 16 kombinací. Klíč: budova musí být vizuálně POŽÍRÁNA digitální strukturou (ne abstraktní geometrie).
- **Petr web review** — Petr chce projít všech 6 stránek lokálně před deploymentem, případně iterativní úpravy.
- **Calendly Pro** — pro správné CTA per service type Petr potřebuje upgrade + vytvořit 6 event types.

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
