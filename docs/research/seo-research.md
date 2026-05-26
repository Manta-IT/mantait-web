# Manta IT - SEO + GEO research

Stav: 2026-05-26. Read-only research na zaklade WebSearch a inspekce mantait.cz souboru.
Cilovka: starsi majitele CZ SMB firem 50-300 lidi, nesnasi IT zargon.

---

## 1. llms.txt - doporuceni: ANO, implementovat (s realistickym ocekavanim)

**Co to je.** Markdown soubor v rootu domeny (`/llms.txt`), index hlavnich URL + kratke
popisy pro LLM crawlery. Spec navrzeny Jeremy Howardem (fast.ai) 2024.
Inspirace robots.txt, ale slouzi opacne - pomaha pri retrieval/citaci, ne pri crawlu.

**Realna adopce kvetna 2026 (rekni to natvrdo).**
- **Anthropic (Claude)**: oficialne respektuje llms.txt v retrieval workflow.
- **Perplexity**: oficialne potvrdilo, pouziva pro page selection prioritization.
- **OpenAI (ChatGPT/SearchGPT)**: nepotvrzeno, ale empiricky pozorovany korelace.
- **Google (Gemini, Google-Extended)**: Gary Illyes 7/2025 potvrdil **nepouziva a neplanuje**.
- Adopce domen: ~10% (SE Ranking studie 300k domen). Z 500M AI bot navstev jen 408 mirilo na llms.txt - tedy nizka real-world crawl aktivita.

**Verdikt pro Manta IT.** Cena implementace = 30 minut. Benefit = Claude + Perplexity + pravdepodobne ChatGPT lepe ingestuji. Riziko = nula (Google to ignoruje, neskodi). **Ano, nasadit.** Plus volitelne `llms-full.txt` (kompletni text vsech 6 stranek pro deep ingestion).

**Drafted obsah** (`/llms.txt`, ~900 B):

```markdown
# Manta IT

> Externi IT reditel pro ceske firmy 20-300 zamestnancu bez vlastniho
> IT vedeni. Petr Kokoska prebira rizeni IT projektu, dodavatelu
> a investic z pozice klienta. Ne konzultace - prevzeti vykonu.

## Sluzby

- [IT governance retainer](https://mantait.cz/#governance): od 50 000 Kc/mes, dlouhodoba role externiho IT reditele
- [AI Assessment](https://mantait.cz/ai.html#assessment): 27 900 Kc, 2 dny u klienta, detailni plan AI nasazeni do tydne
- [AI Assessment Lite](https://mantait.cz/ai.html#assessment-lite): 11 900 Kc, 4 hodiny online, report do tydne
- [Web Standard](https://mantait.cz/weby.html#web-standard): 16 900 Kc, profesionalni web do 2 tydnu
- [Web Quick](https://mantait.cz/weby.html#web-quick): 8 900 Kc, jednoducha vizitka do tydne
- [Raynet CRM specializace](https://mantait.cz/raynet.html): od 15 000 Kc, konzultace + integrace
- [Projektove rizeni](https://mantait.cz/#sluzby): 10 000 Kc/den, externi PM
- [Product Discovery a Ownership](https://mantait.cz/#sluzby): 10 000 Kc/den

## O zakladateli

- [O mne - Petr Kokoska](https://mantait.cz/o-mne.html): 10 let praxe (PO, senior PM, head of IT), case studies

## Kontakt

- [Kontakt + kalendar](https://mantait.cz/kontakt.html): petr.kokoska@mantait.cz, +420 732 329 431
```

---

## 2. Czech keyword research - top 30 (intent v zavorce)

Bez Trends API, odvozeno z konkurencnich SERPu, Seznam autocomplete logiky a CZ B2B konvenci. **Volume neuvadim** (bez Marketing Miner/Collabim by to byla fikce).

**Externi IT vedeni / fractional CTO:**
1. externi IT reditel (commercial)
2. externi CTO (commercial)
3. IT manazer na cas (commercial)
4. interim IT manager (commercial)
5. fractional CTO Cesko (commercial, EN term, nizsi volume)
6. IT na klic pro firmy (transactional)
7. IT vedeni externe (commercial)
8. kdo nam povede IT (informational)

**IT governance / IT pro SMB:**
9. IT governance mala firma (informational)
10. IT poradenstvi pro mala podniky (commercial)
11. spravovani IT externe (commercial)
12. rizeni dodavatelu IT (informational)
13. audit IT nakladu (commercial)

**Product / projektove rizeni:**
14. externi project manager IT (commercial)
15. product owner externi (commercial)
16. discovery noveho systemu (informational)
17. zadani pro vyvoj softwaru (informational)
18. specifikace ERP (informational)

**AI assessment:**
19. AI audit firma (commercial)
20. kde nasadit AI ve firme (informational)
21. AI pro male firmy (informational)
22. AI strategie pro firmu (informational)
23. AI poradenstvi Praha (commercial)
24. ROI umela inteligence (informational)

**Raynet:**
25. Raynet konzultant (commercial)
26. Raynet zavedeni (transactional)
27. Raynet Pohoda integrace (transactional)
28. Raynet implementacni partner (commercial)

**Weby:**
29. profesionalni web mala firma rychle (transactional)
30. tvorba webu pro zivnostniky (transactional)

**Klicova zjisteni.**
- Cilovka skutecne hleda **"externi IT reditel"** (CZ) ne "fractional CTO" (EN). Petruv copy uz to ma spravne.
- "kdo nam povede IT" / "kdo prevezme IT" - long-tail informational. Vyhrava blog post / FAQ format.
- "AI audit" je v ceske konkurenci uz obsazeno (AIExcellence, EY, AIRI od asociace AI). Diferenciace pres "Lite" verzi za 11 900 Kc je legitimni hra - **cena v subjectu** je u teto cilovky positive (jine kategorie nez velky enterprise).
- Raynet category - SCOVECO, Dativery, Connectify, rpcon.cz uz drzi keywords kolem "Raynet Pohoda integrace". Manta IT nemuze konkurovat na nastrojove urovni - **musi hrat na product owner / nasazeni / lidska strana**, ne na "middleware".

---

## 3. Synonyma a varianty - CZ alternativy IT zargonu

Petr ma uz vetsinu spravne v body copy. Kde mu chybi konzistence: schema.org `knowsAbout`, alt textu, H2 nadpisech ne-prvni urovne.

| EN termin | CZ varianty (priklady) | Doporuceni |
|---|---|---|
| Fractional CTO | externi IT reditel, IT manazer na cas, IT reditel na zkraceny uvazek | hlavni: "externi IT reditel" (uz pouziva). Sekundarni v textu: "IT vedeni na cas". |
| IT governance | vedeni IT, rizeni IT, spravovani IT, IT pod kontrolou | doplnit "vedeni IT" jako H2 alternativu. Hlavni heading drzet "IT governance" - lide casteji **prekopiruji termin nez ho vymysleji**. |
| Product Discovery | definice zadani, rozbor produktu, priprava zadani, mapovani procesu | uz pouziva "definice zadani" - drzet. Pridat ve FAQ formulaci "co je product discovery cesky". |
| Vendor management | rizeni dodavatelu, sprava dodavatelu, dohled nad dodavateli | uz pouziva spravne. |
| Retainer | mesicni paushal, prubezna spoluprace, dlouhodoba spoluprace | je v textu OK ("retainer" + "mesicne"). |
| AI assessment | rozbor AI prilezitosti, audit AI moznosti | doplnit jako alt H1 na ai.html ("kde ma AI ve vasi firme smysl"). |
| Product Owner | vlastnik produktu, garant produktu | doplnit jeden vyskyt "vlastnik produktu" pro CZ-only search. |

**Pravidlo pro meta tagy.** Petr by mel **mixovat oboji**: hlavni keyword v CZ + ojedinely EN termin v JSON-LD `knowsAbout` (LLM modely casto cross-referenuji EN terminy). Naopak `<title>` a `<meta description>` drzet v CZ - tam ctou ji lide z SERPu.

---

## 4. GEO best practices (kveten 2026) - co realne funguje

Na zaklade May 2026 zdroju (Backlinko, Firebrand, llmrefs, mersel.ai):

**Co funguje.**
1. **Definition-first openings.** Studie: prvni veta v definicnim formatu = 34 dennich AI citaci za 7 dni vs <5 u "narativnich" openings. Manta IT to **uz dobre dela** v hero ("Pro firmy, ktere potrebuji nekoho, kdo IT ridi - ne radi"). Ale na podstrankach (raynet, weby) je hero spis pohadkove. Doporuceni: prvni veta = jasna definice.
2. **FAQ schema s viditelnymi otazkami** = nejvyssi-yield pro LLM. Manta IT to ma na ai/weby/raynet, **chybi na index.html a o-mne.html**. Pridat.
3. **Strukturovana data, vrstvene.** Organization > ProfessionalService > Service > FAQ > Review. Manta IT ma 4 z 5; **chybi Review/Rating** (pravdepodobne neaplikovatelne dokud nema verejne reference).
4. **Entity density.** Pojmenovavat skutecne entity (Pohoda, Raynet, Salesforce, HubSpot, GA4) - LLM napaduje text vic, kdyz uvidi sit znamych entity. Manta IT to ma slusne.
5. **Cross-platform brand presence.** LLM citation correlation s brand search volume + mentioned externally. **Manta IT chybi:** LinkedIn company page, GitHub Manta-IT org sameAs odkaz, Firmy.cz zapis.
6. **Content freshness.** LLM preferuji recent date. Pridat "Posledni aktualizace: 2026-05" na index.html footer (a aktualizovat ctvrtletne).
7. **Conversational copy.** Strukturovane jak otazka-odpoved pasaze, ne marketingove blistery. Petruv copy je v tom **OK**.

**Co NEFUNGUJE (mytus).**
- Hidden metadata / invisible text pro LLM = porusi guidelines (Google FAQ schema vyzaduje match visible content).
- Keyword stuffing v `<meta keywords>` = ignorovano vsemi modely 10+ let.
- Inflacni FAQPage schema (otazky co nejsou na strance) = riziko struct-data penality.

---

## 5. Konkretni doporuceni per soubor

**index.html:**
- Pridat `og:image` + `twitter:card` + `og:locale=cs_CZ` (vse chybi).
- Pridat `Organization.sameAs` s LinkedIn osobnim profilem Petra + GitHub Manta-IT org (LLM cross-ref).
- Pridat FAQPage schema se 4-5 nejcastejsimi otazkami (cena retaineru, pro koho, jak zacit, geografie, doba spoluprace). Otazky musi byt viditelne v HTML.
- Hero opening: posunout direct definicni vetu pred quote ("Manta IT je externi IT vedeni pro ceske firmy bez vlastniho IT reditele.").
- Pridat BreadcrumbList schema (i kdyz je root, pro konzistenci).

**o-mne.html:**
- Canonical bug: pouziva `/o-mne/` (trailing slash, bez .html), ale sitemap a navigace `/o-mne.html`. **Sjednotit na `.html`** (drz sitemap, oprav canonical).
- `Person.image` ukazuje na `favicon.svg` - placeholder. Nahradit realnou fotkou (1200x630 OG-compatible).
- Pridat `Person.sameAs` s LinkedIn URL Petra.
- Pridat dalsi role do `Person.knowsAbout`: "Modular monolith", "Next.js", "ATDD" - LLM ho budou citovat v rumzitejsich AI dotazech.

**ai.html:**
- Pridat `og:image` (specifickou pro AI tema, ne sdilenou).
- V FAQPage rozsirit o 2 otazky: "Kolik stoji nasadit AI ve firme po Assessmentu?" a "Jaky je rozdil mezi Lite Assessmentem a free AIRI dotaznikem od asociace AI?" - druhe je defensive moves proti konkurenci.
- Definition-first hero: prvni veta "Kde ma AI smysl?" je rhetorical, ne definitional. Doplnit: "AI Assessment je strukturovany rozbor procesu vasi firmy s cilem najit, kde realna AI nasazeni vrati investici."

**weby.html:**
- Canonical OK.
- Konkurence ma na "tvorba webu pro zivnostniky" mnoho cenove podhozenych nabidek (od 69 Kc/mes). Manta IT nesoutezi cenou - musi v copy explicitne **pojmenovat differenciator**: "Ne sablona, ne pronajem - vlastnite kod i domenu." V FAQ uz je, ale prevest do H2 nad ceniku.
- Pridat `og:image` s konkretnim webem (mockup screenshot, ne brand).
- FAQ: pridat "Jaky je rozdil mezi Web Quick a hotovou sablonou na Webnode/Wix?" - long-tail informational, ktery vede ke konverzi.

**raynet.html:**
- **Differentiate pres Product Owner ulou**, ne pres nastrojova reseni. Konkurenti (Connectify, Dativery, SCOVECO, rpcon.cz) ovladaji "Raynet Pohoda integrace" keyword. Manta IT zvitezi na "Raynet konzultant na strane klienta" + "audit stavajici Raynet implementace".
- Pridat `Organization.knowsAbout` s "Raynet API", "Pohoda mServer", "REST API integrace" - LLM dotaz "kdo umi Raynet integraci" zachyti hloubku.
- Case study sekce je silna. Pridat schema.org `Article` nebo `CaseStudy` markup (Schema.org `Article` typu).
- Status "Raynet partner: prochazi registrace" - aktualizovat hned po dokonceni, je to silny trust signal.

**kontakt.html:**
- Canonical `/kontakt/` (trailing slash) vs sitemap `.html` - **stejny bug jako o-mne.html**. Sjednotit.
- `Organization` mainEntity je OK, ale chybi `openingHours` (i kdyz je to consulting, "Po-Pa 9-18" je standard pro local pack signal).
- Pridat `geo` souradnice Prahy (50.0755, 14.4378) do contact schema pro local SEO.

---

## 6. Sitemap.xml + robots.txt review

**Sitemap.xml - co je OK.** Vsechny 6 URL, lastmod, changefreq, priority.
**Co chybi/optimalizovat.**
- `lastmod` u kontakt.html je `2026-05-25` a `changefreq=yearly` - nekonzistentni (kdy se to opravdu meni rocne, pak lastmod ma byt starsi). Ujasnit.
- Index priority 1.0, podstranky 0.7-0.9 - rozumne.
- **Pridat URL `/llms.txt`** do sitemap **NE** (sitemap je pro HTML/PDF, ne pro spec soubory).
- Zvazit `<image:image>` extensions pro hlavni OG image - dobry signal pro Google Images.

**Robots.txt - co je OK.** Vse povolene, sitemap referencovany.
**Co pridat (May 2026 standard).**
- Explicitne povolit AI crawlery (default je dnes ambivalentni - GPTBot, ClaudeBot, PerplexityBot, Google-Extended). Pokud Petr **chce** byt v LLM odpovedich (a chce - to je cely point GEO), musi explicitne allowit:

```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://mantait.cz/sitemap.xml
```

Bez tohoto je default ruzny per crawler - nektere respektuji "User-agent: *" allow, nektere vyzaduji explicitni mention. Pojistit se vyplati.

---

## 7. Open Graph + Twitter Card - kompletni sada pro CZ web

Soucasne: jen `og:title`, `og:description`, `og:type`. **Chybi vse ostatni.**

**Minimum pro pripravu na sdileni do CZ social (Facebook, LinkedIn, WhatsApp, Twitter/X, Threads):**

```html
<!-- Open Graph -->
<meta property="og:title" content="Manta IT - externi IT reditel pro ceske firmy">
<meta property="og:description" content="...">
<meta property="og:type" content="website">
<meta property="og:url" content="https://mantait.cz/">
<meta property="og:locale" content="cs_CZ">
<meta property="og:site_name" content="Manta IT">
<meta property="og:image" content="https://mantait.cz/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Manta IT - Petr Kokoska, externi IT reditel">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Manta IT - externi IT reditel">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="https://mantait.cz/og-image.png">
<meta name="twitter:image:alt" content="...">
```

**Priorita pro CZ:**
1. `og:image` (1200x630 PNG/JPG, <300 KB) - **nejdulezitejsi**. LinkedIn + WhatsApp + Messenger pouzivaji. Bez tohoto je nahled prazdny.
2. `og:locale=cs_CZ` - Facebook locale-aware rendering.
3. `og:site_name` - branding v share cards.
4. `twitter:card=summary_large_image` - pro pripadne X/Threads share.
5. Per-stranka unikatni `og:image` (ne shared brand) - mnohem vyssi CTR.

**Co NEDAVAT pro CZ:** `og:fb:app_id` (Petr nema FB app), `twitter:creator` (Petr nema X profil), `og:audio/video` (nerelevantni).

---

## Top 10 priority changes (poradi co delat nejdriv)

| # | Akce | Effort | Impact |
|---|---|---|---|
| 1 | **Fix canonical inkonzistence** (o-mne.html, kontakt.html: trailing slash vs .html) - SJEDNOTIT na .html dle sitemap | 10 min | Vysoky (duplicate content riziko, indexace) |
| 2 | **Vytvorit og-image.png** 1200x630 (brand + Petr foto + tagline) a referencovat ze vsech 6 stranek | 2 h | Vysoky (social share CTR) |
| 3 | **Implementovat /llms.txt** dle draft v sekci 1 | 30 min | Stredni (Claude + Perplexity citace, ChatGPT pravdepodobne) |
| 4 | **Doplnit robots.txt** o explicitni allowy pro GPTBot, ClaudeBot, PerplexityBot, Google-Extended | 5 min | Vysoky pro GEO |
| 5 | **Pridat FAQPage schema na index.html a o-mne.html** (5+ otazek viditelne na strance) | 1 h | Vysoky (LLM citace + Google Rich snippets) |
| 6 | **Doplnit OG sadu** (og:image, og:locale, og:site_name, og:url) + twitter:card vsude | 30 min | Vysoky |
| 7 | **Nahradit Person.image** (favicon.svg) realnou fotkou Petra (1200x630 nebo 800x800 square) | 1 h (focusing real photo asset) | Stredni |
| 8 | **Pridat sameAs** do Organization a Person schemas (LinkedIn, GitHub Manta-IT) | 15 min | Stredni (entity linking) |
| 9 | **Zaregistrovat Firmy.cz zapis** (free, kategorie "IT poradenstvi", "Webdesign", "AI poradenstvi") + Google Business Profile | 1 h | Vysoky pro Seznam.cz |
| 10 | **Definition-first opening hero** na vsech podstrankach (raynet, weby, ai) - prvni veta = jasna definice sluzby | 30 min | Stredni (GEO citation factor) |

**Nice-to-have pozdeji:** llms-full.txt, geo souradnice v kontakt schema, openingHours, Article/CaseStudy schema na raynet case study, ctvrtletne aktualizovany "Posledni revize" footer.

---

## Co odlozit / nedelat

- **Neprepisovat CZ copy na anglicismy.** "Fractional CTO" do `<title>` nepatri - cilovka to nehledaa a Petruv positioning je "ne dalsi konzultant", anglicismy by to popreli.
- **Nepridavat invisible/hidden GEO metadata.** Mytus, riziko penality.
- **Negenerovat falesne Review schema.** Bez verejnych referenci je to spam signal.
- **Nehrat Raynet middleware keyword.** Konkurence je usazena, Manta IT vyhraje na "konzultant na strane klienta", ne na technologii.

---

## Zdroje (kveten 2026)

- [State of llms.txt 2026 - Presenc AI](https://presenc.ai/research/state-of-llms-txt-2026)
- [llms.txt May 2026 honest guide - Codersera](https://codersera.com/blog/llms-txt-complete-guide-2026/)
- [llms.txt official spec - llmstxt.org](https://llmstxt.org/)
- [GEO best practices 2026 - Firebrand](https://www.firebrand.marketing/2025/12/geo-best-practices-2026/)
- [GEO complete guide - Backlinko](https://backlinko.com/generative-engine-optimization-geo)
- [GEO for B2B 2026 - Mersel AI](https://www.mersel.ai/generative-engine-optimization)
- [Schema markup AI search 2026 - Discoverability](https://discoverability.co/resources/schema-markup-guide/)
- [Perfect JSON-LD service business 2026 - WebTrek](https://webtrek.io/blog/the-perfect-json-ld-for-a-service-business-in-2026)
- [Firmy.cz B2B sluzby](https://en.firmy.cz/All-for-business/Business-services)
- [Optimalizace Seznam Firmy.cz - David Pavelka](https://david-pavelka.cz/cs/sluzby/optimalizace-pro-seznam-cz-a-firmy-cz/)
- [Robots.txt for AI crawlers 2026 - Cubitrek](https://cubitrek.com/blog/robots-txt-2026-managing-ai-crawler-budgets)
- [Raynet implementacni partneri](https://podpora.raynet.cz/hc/cs/articles/360021813791-P%C5%99ehled-implementa%C4%8Dn%C3%ADch-partner%C5%AF)
- [AI audit konkurenti - AIExcellence](https://www.aiexcellence.cz/ai-audit-implemetace-pro-firmu)
- [Czech AI Readiness Initiative (AIRI)](https://asociace.ai/airi/)

(Slovni rozsah: ~2350 slov.)
