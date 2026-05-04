# MantaIT Web -- STATUS
> Aktualizovano: 2026-04-16 | Oblast: VENTURES
> Zdroje: web/CONTEXT.md, parent CONTEXT.md (manta-it), STATUS.md (predchozi 2026-04-15) | TrueMemory MCP v teto session nedostupny -- fallback na predchozi STATUS

## Stav
**ready-to-publish** | Priorita: MED | Posledni zmena: 2026-04-11

## Blocker
Domena mantait.cz -- stav neznamy (nezkontrolovano: owner, DNS, MX). Bez overeni domeny a rozhodnuti o hostingu nelze publikovat. Email petr@mantait.cz je v kontaktu na strance ale MX funkcnost neoverena. Placeholdry (telefon +420 000 000 000, ICO 00000000) stale v HTML.

## Action list
- [ ] Overit stav domeny mantait.cz (registrator, expiraci, DNS, MX)
- [ ] Rozhodnout hosting: GitHub Pages / Vercel / vlastni hosting (spec doporucuje GitHub Pages nebo Netlify)
- [ ] Doplnit realne telefonni cislo (aktualne placeholder +420 000 000 000)
- [ ] Doplnit realne ICO (aktualne placeholder 00000000)
- [ ] Pridat OG meta tagy (title/description hotove, OG chybi)
- [ ] Pridat bio + foto Petra (doporuceni UX reviewu -- zvysuje duveryhodnost)
- [ ] Pridat case studies + testimonials (doporuceni UX i marketing reviewu -- social proof, min. 1 anonymizovana case study)
- [ ] Implementovat SEO doporuceni z market research (H1 optimalizace, meta description)
- [ ] Nasadit Google Analytics / sledovani konverzi
- [ ] Publish a overit kontaktni tok (formular/email)

## Namety (zmineneho, nezacate)
- Zrevidovat web agentem pro B2B review (zmineno jako TODO v lead gen projektu: project_mantait_web_agent_review.md)
- Pridat lead magnet (PDF/checklist) pro email capture nad pouhy kontakt
- Zvazit pridani sekce O mne / foto (spec oznacuje jako "zatim mimo scope", ale reviews doporucuji pridat)

## Mozne prinosy
- Vizitka pro cold outreach (LinkedIn DM / email) -- prijemce si overi Petra
- Konverzni bod pro organic traffic (SEO) i placene kampane
- Social proof pres case studies reduce risk pro CEO prospektu
- Dulezity prvek lead gen systemu -- outreach vede na tento web

## Strategie
- Jednoducha staticka landing (ciste HTML/CSS + minimum JS, bez frameworku) -- rychla, udrzovatelna
- Design: tmavy (#080808 / #0a0a0a), zlaty akcent (#C9973A), Cormorant Garamond (display) + DM Sans (body)
- Plna responzivita (breakpointy 900px, 600px)
- Hero: "IT ma firmu posouvat. Ne zamestnavat vedeni."
- Diferenciator: "Konzultanti doporucuji. Ja prebiram rizeni."
- Low barrier CTA: "30 minut. Bez zavazku." + "Domluvit konzultaci"
- Pricing transparency: 8-10k/den, IT retainer od 50k/mesic, IT revize individualne
- Struktura: Hero -> Mozna resite (3 scenare) -> Jak spoluprace probiha (4 kroky) -> Zpusoby spoluprace (3 karty) -> Proc to neni konzultant -> Kontakt
- Positioning strong (potvrzeno marketing/UX/SEO reviews) -- management through AI jako core strategy

## Souvislosti
- **MantaIT Lead Gen** (parent workspace) -- web je vizitka cilova landing pro outreach; dokonceni webu je akcni bod lead gen projektu
- **manta-it brand/positioning** -- copy a differentiator jsou sdilene s brand vrstvou
- **Reviews hotove** -- marketing, UX, SEO review vsechny provedene 2026-04-11; nalezy zakotvene v action listu
- **Design spec** -- docs/superpowers/specs/2026-04-10-mantait-web-design.md (schvaleno k implementaci, 6 sekci Layout B)

## Konflikty zdroju
! Memory fact: "MantaIT Web je ready, HTML stranka vytvorena" x web/CONTEXT.md: "Hotova HTML stranka -- zatim nepublikovana"
-> Vyhodnoceni: shoda v obsahu (HTML hotove), rozdil v interpretaci "ready". Stav ready-to-publish: kod pripraveny, publish blokovany domenou a doplnenim placeholders.
! Spec: "Zadny formular, zadny Calendly, zadne O mne / foto (zatim)" x web/CONTEXT.md: "Pridat bio+foto Petra (doporuceni UX reviewu)"
-> Vyhodnoceni: spec z 2026-04-10 definuje MVP bez bio/foto, UX review z 2026-04-11 doporucuje doplnit. Novejsi doporuceni vitezi -- pridani bio/foto je v action listu.
! web/CONTEXT.md: "tmavy #0a0a0a" x parent STATUS spec: "tmavy #080808"
-> Vyhodnoceni: drobny nesoulad v hex kodu pozadi (#0a0a0a vs #080808) -- pravdepodobne spec drive ladena, web/CONTEXT stav implementace. Overit v index.html pri nasledujici praci; pro ucely statusu nerozhodne.
