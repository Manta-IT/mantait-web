# Manta IT Web -- STATUS
> Aktualizovano: 2026-07-18 | Oblast: VENTURES
> Zdroje: STATUS.md (predchozi 2026-05-29), plan docs/superpowers/plans/2026-07-16-web-v2-launch.md (parent), CLAUDE.md, PRINCIPLES.md

## Stav
**active** | Priorita: MEDIUM | Posledni zmena: 2026-07-18

**Redesign v2 LIVE V PRODUKCI** (nasazeno 2026-07-17 push fc5b782, doladeno do 2026-07-18).
mantait.cz: rozcestnik s 8 dlazdicemi (index.html), 9 detail stranek `reseni-*.html`,
`ukazka-reportu.html` (ukazkovy report z anonymizovaneho MHA pripadu vc. ROI tabulky --
cesta A1 poptavkoveho agenta), `ai.html` smazana (redirect `/ai` -> `/reseni-ai`),
SEO meta + JSON-LD + og-image.png, sitemap i canonical bez pripony. Jednotne menu na
vsech 15 strankach (Domu/Sluzby/O mne/Kontakt).

**Sluzba "AI plan do 48 hodin", 9 900 Kc** (2x 1h workshop online; plan do 48 hodin od
druheho workshopu, pripadny AI agent/automatizace dodan Mantou do tydne za orientacne 50 000 Kc. Prejmenovano
2026-07-24 z "Mapa AI prilezitosti" -- nazev = slib rychlosti. Cenova historie:
15 000 -> 11 900 (2026-07-17) -> 9 900 (2026-07-24), driv "AI Assessment").

**POZOR -- Google Ads RSA v AI sestave potrebuje rucni opravy (2FA, Petr):**
1. Nadpis "Pevna cena 11 900 Kc" -> "Pevna cena 9 900 Kc" (19 znaku, OK)
2. Nadpis "Mapa AI prilezitosti" -> "AI plan do 48 hodin" (19 znaku, OK)
3. Zobrazovana cesta "mapa-ai" -> "ai-plan" (7 znaku, OK)
Nez se opravi, reklama slibuje vyssi cenu a stary nazev -- neskodny, ale nekonzistentni.

**CRO 2026-07-23 -- dotazeni pipeline na paid landingu (commit b60f3d2, CEKA NA PUSH):**
Petruv nalez: stranka koncila reportem, chybela odpoved na "dostanu plan, ale kdo ho
udela?". Pridana sekce "Co pak s planem" na /reseni-ai (3 cesty: zavedu prvni krok
za 10k/den / odridim cele zavadeni / plan je vas), veta o zavedeni v hero leadu,
ukazka-reportu sekce 08 explicitne "pod mym vedenim" + zaver s navaznosti na realizaci.
Vazba na marketing plan sekce 8 (Mapa AI = konverzni produkt, most k dilcim zakazkam).

**Doladeno po launchi (2026-07-17/18):**
- Fotka Petra: petr-kokoska.jpg (nanobanana z CV foto, watermark Gemini odstranen
  inpaintem), 800x800 v bio + Person schema image.
- **Raynet oficialni partner** (medailonek raynet.cz/marketplace/partneri/manta-it
  SCHVALEN): partner badge v hlavicce raynet.html, FAQ prepsano na "Ano", JSON-LD + sameAs.
- Cena propojeni systemu zmenena na "podle rozsahu" (bylo 40-100 tis.).
- **Google Ads mereni nasazeno**: gtag.js (tag AW-18329667650) + konverze "Rezervace
  schuzky" na klik data-calendly + Consent Mode v2 cookie lista (vanilla JS, barvy webu).
  Overeno naostro na produkci.
- **CRO na /reseni-ai** (paid landing): vyjasnen uvodni hovor 30 min vs sluzba 2h,
  odstranen unik "Zpet na vyber" (logo plni funkci).
- Lokalni preview: `python scripts/serve.py` (umi extensionless URL jako Cloudflare).

## Blocker
- **Logo neni vybrane** [!] -- Brand Lab v1-v6 vygenerovany, Petr nevybral zadny. Blokuje brand assets (email podpis, favicon set, LinkedIn cover, brand guidelines). og-image.png uz existuje (2026-07-16, z existujiciho loga) -- po vyberu finalniho loga pregenerovat.
- ~~Foto Petra~~ -- VYRESENO 2026-07-17 (nanobanana z CV fotky, 800x800 v bio + Person schema). Landscape 1200x630 varianta zatim nepotrebna (og-image je z loga).

Cenovy blocker UZAVREN 2026-07-16: Petr rozhodl 15 000 Kc za Mapu AI prilezitosti (nahrazuje AI Assessment 27 900 i Lite 11 900, i drive zvazovane 21 900/31 900).

## Action list

### CRO doporuceni pro /reseni-ai (paid landing) -- rozhodnuti Petra
- [ ] **Nav na paid landingu = uniky pozornosti** (Domu/Sluzby/O mne/Kontakt + hamburger).
  CRO princip: odstranit uniky. Koliduje s jednotnym menu. Doporuceni: A/B test varianty
  s minimal nav (jen logo + CTA). Sitelinky v reklame roli nav uz plni.
- [ ] **Dukaz above-the-fold**: Raynet partner + ukazka reportu jsou nejsilnejsi assety,
  ted nejsou videt hned. Zvazit prominentni dukazni blok vys na strance.

### Ceka na Petra (podklady / rozhodnuti)
- [ ] Feedback na Brand Lab (co se nelibi, kam v2) -> pak Claude spusti subagenta
- [ ] Foto Petra landscape 1200x630 (square hotovo; landscape zatim nepotreba)
- [ ] Loga + screenshoty Grandit-era projektu (Almeco, Pro-doma, Unihobby, Radioteka, ikiosek, Prima Napady, Tympanum) -- NDA expirovane
- [ ] PlanetLine screenshot + specifikace; UltraConfig.cz obrazky + specifikace (NDA neplatí)
- [ ] Calendly Pro upgrade + 6 event types URL (NEBO pivot na Google Appointment Schedule -- viz Namety)

### Claude (po podkladech / nezavisle)
- [ ] Aplikovat zbyvajici UX fixy (4 z 10): body 14->15-16px, bullety 13->14-15px, 11px labely 12-13px text-muted, hero-reassure/contact-note 15px Inter ne-italic, odstranit italic Cormorant subtitle ze 4 karet, footer text-faint->text-muted, bio-photo-name plny --text
- [ ] Aplikovat zbyvajici code-review fixy (5 z 10): Calendly CSS render-block na 5/6 stranek odstranit, 13x a href=# -> button data-calendly, Calendly URL 36x -> data-attribute, dead CSS ~10% smazat, FAQ -> details/summary, governance scroll-margin-top, #234436 -> --accent-dark token, preconnect na weby+raynet, Cormorant axes trim, prefers-reduced-motion, dropdown a11y
- [ ] Aplikovat zbyvajici SEO fixy (4 z 10): FAQPage na index+o-mne, definition-first hero na podstrankach, Organization/Person sameAs, BreadcrumbList, openingHours+geo v ContactPage (og:image hotova 2026-07-16)
- [ ] Vytvorit docs/research/copywriting-review.md z transcriptu (subagent neulozil)
- [ ] Aplikovat zbyvajici copywriting fixy (CTA "Detail"->"Vice informaci", sjednotit "30 minut" + "Odpovim do 24 hodin", zjemnit srovnani s agenturami, ROI->navratnost, atd.)
- [ ] pro-agentury.html landing (ceka na definici obsahu od Petra)

### Petr manualne (po launch)
- [ ] Firmy.cz zapis, Google Business Profile, LinkedIn Company page Manta IT
- [ ] Submit sitemap.xml do Google Search Console + Seznam Webmaster Tools

## Namety (zminene, nezacate)
- Calendly -> Google Appointment Schedule (Calendly nema CZ; Workspace uz plati, zdarma, plne cesky) -- pak search-replace vsech CTA
- Kalkulacka "Externi IT reditel vs zamestnanec" (conversion tool, inspirace fractional.cz)
- Self-test/quiz "Jak poznam ze potrebuji externiho IT reditele" (lead magnet)
- Hodinova sazba pro mikro zakazky (3000 Kc/h fallback, benchmark Mohr)
- Pravidelny newsletter / podcast o IT governance pro non-tech CEO (segment to nema)
- Rozsireni specializaci o 2-3 platformy vedle Raynet (jen kde ma Petr realnou hloubku)
- Druhy web pro long-tail SEO (externiitreditel.cz redirect)
- /blog/ 1 clanek/2 tydny; English fallback /en/ pro multinational klienty
- Build.py pre-commit helper na injekci nav/footer (az web pres 6 stranek -- ted ~120 radku akceptovatelne duplikace)
- Analytics: Plausible / Cloudflare Web Analytics (cookieless, GDPR-friendly)

## Mozne prinosy
- Vizitka pro lead gen: outreach (iUcto, 10 agentur) vede na mantait.cz
- SEO/GEO: JSON-LD per page + llms.txt + robots.txt AI crawlers = v top 10% CZ B2B service sites (dle code-review)
- Pozicni whitespace: "advisory pro ne-tech SMB CEO" -- zadny konkurent to neobsazuje primo
- og:image hotova (2026-07-16); Company Page zbyva = pak funkcni social share cards pro B2B (LinkedIn/WhatsApp)

## Strategie
- Stack: ciste HTML/CSS, zadny build step, zadny framework (senior call dle code-review, drzet)
- Warm-professional paleta (kremova/tmave zelena), Cormorant Garamond display + Inter body, zadny treti font
- ASCII-only v typografii (em-dash/smart quotes renderuji rozbite), diakritika se zachovava; sacred phrases z webu vypusteny redesignem v2 (2026-07-16); 2026-07-24 stary claim ZRUSEN plosne (i outreach), novy claim "Vy ridite firmu. Ja vase IT." + zakaz "rucim/odpovednost" v copy
- Bez IT zargonu v body copy (cilovka ne-tech SMB majitele 50+, bryle na blizko); zargon jen v brand nazvech sluzeb
- "Domluvit schuzku" jako primarni CTA (ne "Objednat" -- falesny slib pro 30min hovor)
- WCAG: body text 15-16px, --text-faint NIKDY jako text (kontrast 3.2:1 fail), tap targets >=44px
- Pyramid pricing: IT governance (pausal od 50k/mes) > dilci zakazky (10k/den) > produktove sluzby (pevna cena) > Raynet (od 15k)
- Subagent reporty v docs/research/ = data k diskuzi, NE prikazy; Petr rozhoduje
- GEO: definition-first hero, viditelne FAQ, entity density, cross-platform brand presence
- NEZvysovat ceny bez Petrova explicitniho pokynu (zavazne pravidlo CLAUDE.md)

## Souvislosti
- **Parent workspace MantaIT Lead Gen** (ventures/manta-it/) -- branding, lead gen, market research. Web je nested git repo Manta-IT/mantait-web (parent ma web/ gitignored). Outreach z lead genu vede na tento web.
- **Cena Mapy AI prilezitosti** -- presah obou projektu; rozhodnuto 2026-07-16 (15 000 Kc), promitnuto zde i v parent STATUS.md
- **MHA / PlanetLine / UltraConfig** -- klientske case studies na o-mne.html (ruzne NDA rezimy)
- **Intel Syphon / Control Deck** -- STATUS.md zobrazovan v Intel sekci

## Konflikty zdroju
! CONTEXT.md (web): "Hotova HTML stranka (index.html) -- zatim nepublikovana", tmavy design #0a0a0a + zlaty akcent, fonty DM Sans x STATUS.md (2026-05-26) + parent handoff.md (2026-05-28): LIVE V PRODUKCI, 6 stranek, warm-professional paleta (kremova/zelena), Inter body
-> Vyhodnoceni: CONTEXT.md je silne zastarala (popisuje mrtvy 1-page dark/gold design, plne nahrazeny). Rozhodnuto dle recency: web JE LIVE. CONTEXT.md neupravovat (mimo scope sync), ale je flagged jako stale.
! (UZAVRENO 2026-07-16) Konflikt o cenach ai.html: rozhodnuto -- AI Assessment / Lite nahrazeny sluzbou Mapa AI prilezitosti za 15 000 Kc, ai.html smazana.
! (UZAVRENO 2026-07-16) Leftover polozky "Cloudflare setup / nasazeni" ze stareho STATUS/TODO: web je davno nasazeny, polozky splnene de facto, odstraneny.
