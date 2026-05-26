# Copywriting review — Manta IT web

> Subagent copywriting review výstup, 2026-05-26.
> Soubory zkontrolovány: `index.html`, `o-mne.html`, `ai.html`, `weby.html`, `raynet.html`, `kontakt.html`. Pouze `<body>` content.
> Top 10 fixů aplikováno 2026-05-26 (gramatika, Baťa cvičky, CTA Objednat → Domluvit schůzku, retainer→paušál, middleware→propojovací aplikace).

## 1. Pravopis a gramatika (top kritické, většina opravena)

| Soubor | Současný text | Problém | Návrh opravy | Stav |
|---|---|---|---|---|
| index.html ř. 124, o-mne.html ř. 124 | "jako svojí práci" | Špatný pád (4. pád akuzativ) | "jako svoji práci" | **FIXED** |
| index.html ř. 199 | "ať si data tečou samy" | Shoda "data" (n., pl.) → "tečou sama" | "ať si data tečou sama" | **FIXED** |
| index.html ř. 241 | "naučím s ním vaše lidi" | Vazba "naučit někoho s něčím" — nestandardní | "zaškolím v něm vaše lidi" | **FIXED** |
| o-mne.html ř. 118 | "Klient na detail nestíhal." | Stylisticky kostrbaté, chybí předmět | "Klient nestíhal hlídat detaily." | TODO |
| o-mne.html ř. 296 | "vedení vědělo, že chce změnu, ale neměla pojmenované" | Shoda neutrum: "vedení vědělo → nemělo" | "vedení vědělo, že chce změnu, ale nemělo pojmenované" | **FIXED** |
| o-mne.html ř. 175 | "hobby market" | Česky "hobbymarket" jedním slovem | "hobbymarket" / "řetězec pro kutily" | TODO |
| raynet.html ř. 134 | "aby do něj nikdo nedíval" | Chybí zvratné "se" | "aby se do něj nikdo nedíval" | **FIXED** |
| raynet.html ř. 144 | "Faktury, partnery, zakázky všechny v jednom světě." | Chybí sloveso, špatný pád | "Faktury, partneři, zakázky — všechno v jednom systému." | **FIXED** |
| raynet.html ř. 162 | "vedení z něj neviděla smysluplné reporty" | Shoda neutrum: "vedení neviděl**o**" | "vedení z něj nevidělo smysluplné reporty" | **FIXED** |
| raynet.html ř. 247 | "Hodí se obchodním společnostem" | OK, v FAQ schema je "obchodníkům" — viz konzistence | — | TODO sjednotit |
| raynet.html ř. 257 | "Definuju, co je potřeba" | Hovorová koncovka -uju, jinde "definuji" | "Definuji, co je potřeba" | TODO |
| weby.html ř. 156 | "Pomoc se Google Analytics" | Předložka s/se — před G správně "s" | "Pomoc s Google Analytics" | TODO |
| weby.html ř. 264 | "jsem schopný dodat" | Hovorové, formálně "schopen" | "schopen dodat" | TODO |
| weby.html ř. 280 | "Drobné úpravy řešíme operativně. Větší rozšíření doceníme" | "doceníme" = uznáme hodnotu; má být "naceníme" | "Větší rozšíření naceníme podle rozsahu" | **FIXED** |
| raynet.html ř. 68, 276 | "Nezměňuje to nic na kvalitě" | "nezměňovat" = nestandardní | "Nemění to nic na kvalitě" | **FIXED** |
| o-mne.html ř. 146 | "Detail rád proberu osobně." | Sg. zní strojeně | "Detaily rád proberu osobně." | TODO |

## 2. IT žargon a anglické termíny (aplikováno top 10, zbývá ~10)

| Soubor | Anglický termín | Český návrh | Stav |
|---|---|---|---|
| index.html ř. 297 | "retainer" | "paušál" | **FIXED** |
| index.html ř. 209, 211, 216, 291, 444 | "reporting" | "přehled výsledků" / "pravidelné výkazy" / "hlášení o stavu" | TODO |
| index.html ř. 238 | "od CRM po ticketing" | "ticketing" → "evidenci požadavků" | TODO |
| index.html ř. 289, 351 | "roadmapě / roadmapa" | "plán rozvoje" / "harmonogram" | TODO |
| index.html ř. 357 | "Migrace na nový ERP nebo e-commerce" | "Přechod na nový ERP nebo e-shop" (ERP OK) | TODO |
| index.html ř. 502 | "produktizované balíčky" | "hotové balíčky s pevnou cenou" | TODO |
| o-mne.html ř. 225 | "Resource management" | "Plánování kapacit" | TODO |
| o-mne.html ř. 225 | "ticketingu (Jira)" | "evidence požadavků (Jira)" | TODO |
| o-mne.html ř. 225 | "onboardingu klientů" | "zavádění nových klientů" | TODO |
| o-mne.html ř. 276 | "Vendor management a kontrola dodavatelů" | "Řízení a kontrola dodavatelů" (duplikát) | TODO |
| o-mne.html ř. 235, 276 | "Adopce AI nástrojů" | "Zavádění AI nástrojů" | TODO |
| o-mne.html ř. 316 | "Discovery dokončené ... implementační fázi" | "Průzkum dokončený ... fáze realizace" | TODO |
| ai.html ř. 122 | "případy užití s reálným ROI" | "případy použití s reálnou návratností" | TODO |
| ai.html ř. 157 | "v zákaznickém servisu" | OK / "v zákaznické podpoře" | drobnost |
| raynet.html ř. 52 | "Raynet ↔ Pohoda middleware" | "Raynet a Pohoda — propojovací vrstva" | **FIXED** (middleware → propojovací aplikace) |
| raynet.html ř. 193 | "(proč middleware, ne pouhý skript nebo externí automatizace)" | "Rozhodl o tom, jak řešení postavit (proč vlastní propojovací aplikace, ne jen rychlý skript)." | **FIXED** částečně |

**Výjimky — brand názvy zachovat:**
- AI Assessment, AI Assessment Lite, Web Standard, Web Quick (brand)
- IT governance (Petr o tom rozhodl, je to název hlavní služby)
- Product Discovery a Product Ownership (název dílčí služby)
- Raynet, Pohoda, Excel, Outlook, Jira (vlastní jména)
- Project Manager, Product Owner, Head of IT, Senior Project Manager (názvy minulých pozic)

## 3. Tonalita

### weby.html
- ✅ **"Díky AI švihnu váš web jak Baťa cvičky"** → FIXED na "Díky AI dodám profesionální web rychleji a levněji, než to umí klasické agentury."

### Obecná tonalita
- Konzistentně dobrá: věcná, sebevědomá, bez buzzwordů
- Hlavní výjimka (zbývá): `weby.html` ř. 264 — srovnání s agenturami "80-200 tis." může vyznit agresivně. Doporučení: "U klasické agentury byste za podobný web zaplatili 80 000 – 200 000 Kč. Já dodám rychleji a levněji díky AI."

## 4. Konsistence (sjednotit napříč soubory)

| Koncept | Varianty | Doporučení |
|---|---|---|
| Forma schůzky / reassurance | "30 minut. Online nebo u vás. Bez závazku." (home) vs "30 minut online, bez závazku." (kontakt, ai) vs "30 minut. Bez závazku. Pochopím vaši situaci." (home kontakt CTA) vs "30 minut online nebo u vás, bez závazku." (weby, raynet) | Sjednotit. **Doporučení:** "30 minut. Online nebo u vás. Bez závazku." |
| Odpověď do 24 h | "Odpověď do 24 hodin" (footer) vs "Odpovídám do 24 hodin" (kontakt 76) | Sjednotit. **Doporučení:** "Odpovím do 24 hodin." |
| Reporting | "reporting" (5×) vs "report" (2×) vs "přehled" (—) | Pro SMB cílovku **"pravidelný přehled" / "měsíční hlášení" srozumitelnější** |
| Discovery | "discovery" (4×) vs "Product Discovery" (název služby OK) | V textu mimo název služby použít **"průzkum" / "mapování zadání"** |
| FAQ Raynet | "obchodníkům, servisním firmám" (JSON-LD) vs "obchodním společnostem" (HTML) | Sjednotit |

## 5. CTA review (kritické — aplikováno top 5)

| CTA | Soubor | Stav | Doporučení |
|---|---|---|---|
| "Domluvit schůzku" | nav, hero, kontakt sekce vsech stránek | ✅ Jasné, věcné, primary CTA | OK |
| "Jak spolupráce probíhá" | index sekundární | ✅ Jasné | OK |
| "Detail" | product cards (4×) | ⚠️ Neutrální, slabé | TODO → "Více informací" / "O službě" |
| "Objednat" | product cards (4×) + ai page CTAs (2×) + web page CTAs (2×) | ✅ FIXED na "Domluvit schůzku k AI Assessmentu" / etc. | OK |
| "Detail →" | specializace karta | ✅ OK pro odkaz na detail stránku | OK |

**Hlavní problém aplikován:** "Objednat" tlačítka vedla na 30min Calendly hovor, nikoliv na objednávku → falešný slib + frustrace. **Fixed všude.**

## 6. Top 20 priority fixes (stav 2026-05-26)

| # | Fix | Stav |
|---|---|---|
| 1 | weby.html ř. 119, 6: "švihnu váš web jak Baťa cvičky" | **DONE ✓** |
| 2 | raynet.html ř. 162: "vedení neviděla" → "nevidělo" | **DONE ✓** |
| 3 | o-mne.html ř. 296: "vedení vědělo … neměla" → "nemělo" | **DONE ✓** |
| 4 | index.html ř. 199: "data tečou samy" → "tečou sama" | **DONE ✓** |
| 5 | raynet.html ř. 68, 276: "Nezměňuje to nic" → "Nemění to nic" | **DONE ✓** |
| 6 | weby.html ř. 280: "Větší rozšíření doceníme" → "naceníme" | **DONE ✓** |
| 7 | "jako svojí práci" → "jako svoji práci" (4. pád) | **DONE ✓** |
| 8 | CTA "Objednat" → "Domluvit schůzku" (4× index, 2× ai, 2× weby) | **DONE ✓** |
| 9 | raynet.html ř. 134: "aby do něj nikdo nedíval" → "aby se nedíval" | **DONE ✓** |
| 10 | raynet.html ř. 144: "Faktury, partnery, zakázky všechny v jednom světě." | **DONE ✓** |
| 11 | index.html ř. 297: "retainer" → "paušál" | **DONE ✓** (částečně, kde to dávalo smysl) |
| 12 | index.html ř. 241: "naučím s ním vaše lidi" → "zaškolím v něm vaše lidi" | **DONE ✓** |
| 13 | ai.html ř. 122: "případy užití s reálným ROI" → "s reálnou návratností" | TODO |
| 14 | o-mne.html ř. 235, 276: "Adopce AI nástrojů" → "Zavádění AI nástrojů" | TODO |
| 15 | o-mne.html ř. 225: "Resource management" → "Plánování kapacit"; "ticketingu" → "evidence požadavků"; "onboardingu" → "zavádění" | TODO |
| 16 | index.html ř. 502: "produktizované balíčky" → "hotové balíčky s pevnou cenou" | TODO |
| 17 | raynet.html ř. 52, 193: "middleware" → "propojovací aplikace / propojovací vrstva" | **DONE ✓** |
| 18 | weby.html ř. 264: srovnání s agenturami "80-200 tis." | TODO zjemnit |
| 19 | Konzistence schůzky: sjednotit formulaci napříč všemi sekcemi | TODO |
| 20 | index.html "Detail" tlačítka → "Více informací" nebo "O službě" | TODO |

**Souhrn:** Top 10 / 20 fixes aplikováno. Zbývá ~10 secondary fixes.
