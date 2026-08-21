# dt13 - Vicejazycny web SK + EN: spec a glosar

> Pracovni spec pro prekladovou cetu. Vetev `vicejazycny-web`.
> Rozhodnuti Petra (task dt13): prelozit vsechno, ceny v EUR, dotacni
> obsah zustava jen CZ.

## Soubory

Kazda CZ stranka X.html dostane kopie `sk/X.html` a `en/X.html`
(stejny nazev souboru). Prekladane stranky (19):
index, o-mne, kontakt, weby, raynet, ukazka-reportu, case-kalkulacka,
soukromi, dekujeme, reseni-ai, reseni-ai-zamestnanec,
reseni-nova-aplikace, reseni-propojeni, reseni-nastroje,
reseni-projekt, reseni-naklady, reseni-bezpecnost, reseni-web,
reseni-vedeni-it.

NEprekladat: dotace-mas, clanky/*, brand-lab*.

## Technicka pravidla (platne pro kazdou SK/EN stranku)

1. `<html lang="sk">` / `<html lang="en">`.
2. HTML struktura, tridy, id a poradi sekci zustavaji 1:1 s CZ.
   Preklada se: viditelny text, title, meta description, og:*, aria-*,
   alt, placeholder, JSON-LD stringy.
3. `og:locale`: `sk_SK` / `en_US`.
4. `canonical` a `og:url`: `https://mantait.cz/sk/<slug>` /
   `https://mantait.cz/en/<slug>` (bez pripony; index = `/sk/`, `/en/`).
5. hreflang blok hned za canonical (slug bez pripony, u indexu prazdny):
   ```html
   <link rel="alternate" hreflang="cs" href="https://mantait.cz/<slug>">
   <link rel="alternate" hreflang="sk" href="https://mantait.cz/sk/<slug>">
   <link rel="alternate" hreflang="en" href="https://mantait.cz/en/<slug>">
   <link rel="alternate" hreflang="x-default" href="https://mantait.cz/<slug>">
   ```
6. Cesty na assety ABSOLUTNE: `/style.css?v=...` (stejny ?v= jako ma CZ
   zdroj), `/favicon.svg`, `/og-image.png`, `/gtag.js`, obrazky
   `/petr-kokoska.jpg` apod. (CZ stranky maji nekde relativni -- opravit
   na absolutni, jinak se v podadresari rozbiji).
7. Interni odkazy: `/x` -> `/sk/x` resp. `/en/x`; `/#kotva` ->
   `/sk/#kotva`. Odkazy na `/dotace-mas` a `/clanky/*`: CELY obsahovy
   blok s odkazem VYNECHAT (viz níže).
8. Prepinac jazyku: posledni prvek UVNITR `<div class="nav-links">`:
   ```html
   <div class="lang-switch"><a href="/<slug>" hreflang="cs">CZ</a><span aria-current="true">SK</span><a href="/en/<slug>" hreflang="en">EN</a></div>
   ```
   (aktualni jazyk je `<span aria-current="true">`, ostatni odkazy).
9. Formular na kontakt: `action="/api/kontakt"` NEMENIT (sdileny Worker).
10. JSON-LD: prelozit stringy, `"price"` v EUR dle tabulky,
    `"priceCurrency": "EUR"`. `areaServed` zustava Ceska republika
    (EN: "Czech Republic", SK: "Cesko" s diakritikou).
11. Typografie: zadny em-dash, smart quotes, ellipsis (ASCII `-`, `"`,
    `...`). Diakritika sk/cs se zachovava. Sipky jen jako `&rarr;`.
12. Zadne AI-tells (zadne "it's not just X, it's Y", rule-of-three,
    prazdna shrnuti, superlativy).

## Obsahove vyjimky

- **index**: karta "Dotace na digitalizaci..." (blok s odkazem
  `/dotace-mas` v sekci init) se v SK/EN VYNECHAVA. Karta noveho
  zakona o kyberbezpecnosti ZUSTAVA (zakon plati pro firmy v CR,
  cilovka SK/EN ma pobocku v CR).
- Vsechny castky v Kc -> EUR dle tabulky. U cen sluzeb zadne Kc.
  V ukazka-reportu prepocitat i castky v tabulkach (zaokrouhlovat
  na desitky EUR, u tisicu na stovky).
- Pokuta "az 100 000 Kc" (povinne udaje): ponechat CZK + zavorka
  (EN: "a fine of up to CZK 100,000 (approx. EUR 4,100)").
- "nejsem platce DPH": EN "I am not a VAT payer, prices are final."
  SK "Nie som platca DPH, ceny su konecne." (s diakritikou).

## Cenova tabulka (kurz CNB 24,12 CZK/EUR, 22. 8. 2026)

| Kc | EUR (psat) |
|---|---|
| 8 900 | 370 EUR |
| 9 900 | 400 EUR |
| 15 000 | 620 EUR |
| 16 900 | 700 EUR |
| 25 000 | 1 050 EUR |
| 30 000 | 1 250 EUR |
| 45 000 | 1 900 EUR |
| 50 000 | 2 100 EUR |
| 89 000 | 3 700 EUR |
| 10 000 / den | 420 EUR / den (EN: per day) |

Kazda cena s priznakem orientacnosti tam, kde CZ pise "od" nebo
"orientacne": EN "from approx. X EUR", SK "od cca X EUR".
Pevne ceny (9 900, 16 900, 8 900, 89 000): EN "EUR 400 flat" styl
netreba, staci "400 EUR" + veta o pevne cene z CZ.

## Glosar (ZAVAZNY - stejne vsude)

| CZ | SK | EN |
|---|---|---|
| Vy ridite firmu. Ja vase IT. | Vy riadite firmu. Ja vase IT. | You run the company. I run your IT. |
| Technologicky reditel na vasi strane | Technologicky riaditel na vasej strane | A technology director on your side |
| Domluvit schuzku | Dohodnut stretnutie | Book a meeting |
| Domu / Sluzby / O mne / Kontakt | Domov / Sluzby / O mne / Kontakt | Home / Services / About me / Contact |
| AI plan do 48 hodin | AI plan do 48 hodin | AI plan in 48 hours |
| AI zamestnanec | AI zamestnanec | AI employee |
| Aplikace na miru | Aplikacia na mieru | Custom application |
| Web Standard / Web Quick | (stejne) | (stejne) |
| 30 minut. Online nebo u vas. Bez zavazku. | 30 minut. Online alebo u vas. Bez zavazku. | 30 minutes. Online or at your office. No commitment. |
| Odpovim do 24 hodin. Bez zavazku. | Odpoviem do 24 hodin. Bez zavazku. | I reply within 24 hours. No commitment. |
| Ukazat reseni | Zobrazit riesenie | See the solution |
| Vice informaci / Detail | Viac informacii | More details |
| pausal | pausal | monthly retainer -> pisat "fixed monthly fee" |
| propojovaci aplikace | prepojovacia aplikacia | integration app (bez slova middleware) |
| Praha a cela CR | Praha a cele Cesko | Prague and the whole Czech Republic |
| zapsan v zivnostenskem rejstriku | zapisany v zivnostenskom registri | registered in the Czech Trade Licensing Register |
| Cestuji za klientem | Cestujem za klientom | I travel to clients |
| Zvedam to sam. | Dviham to sam. | I answer the phone myself. |

(Tabulka je bez diakritiky kvuli ASCII - v HTML samozrejme S diakritikou:
"Dohodnúť stretnutie", "Vy riadite firmu. Ja vaše IT." atd.)

## Ton

- SK: prirozena spisovna slovencina, ZADNE cechizmy (skontrolovat
  napr.: "protoze"->"pretoze", "rikam"->"hovorim", "sve"->"svoje",
  "ktery"->"ktory", "jestli"->"ci"). Vykanie.
- EN: vecna business anglictina, kratke vety, zadny korporatni zargon,
  cilovka: zahranicni majitel/reditel firmy s pobockou v CR. Zadne
  "leverage/streamline/empower".
- Brand jmena (Manta IT, Raynet, Pohoda, Cloudflare, Google) nemenit.
- Jmena klientu a reference nemenit, NDA formulace zachovat vyznamove.
