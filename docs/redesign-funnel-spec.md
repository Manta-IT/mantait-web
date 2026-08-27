# Redesign webu Manta IT - interaktivni funnel

> **PREKONANO 27. 8. 2026 redesignem.** "SOURCE OF TRUTH" nize plati jen pro
> cervnovou etapu; brand tokeny, ktere dokument uvadi (EB Garamond + Inter,
> bezova/zelena), jsou mimo identitu. Vizual urcuje skill `manta-brand`, obsah
> a strukturu webu `web/PRINCIPLES.md`. Dokument zustava jako historie
> rozhodovani.

> Vytvoreno: 2026-06-01 | Status: KOSTRA (pred designem/implementaci)
> Vznik: brainstorming Petr + Claude na zaklade feedbacku Petry Sebo (realna zakaznice) + Petrovy strategicke uvahy
> Tento dokument je SOURCE OF TRUTH pro redesign. Copy zmeny z 2026-06-01 (lidsky ton, zruseni porovnavani) se do nej zapracuji.

---

## 1. Proc redesign (problem se soucasnym webem)

Soucasny web spari cloveka pres pain karty ("ano, tohle resim"), pak ho ale odpali:
- **Hlavni nabidka = IT governance od 50 000 Kc/mesic** hned nahore. Nikdo nevi, co IT governance je, a hned velka castka. Klient scrollne, vidi 50k, odejde.
- **Hraz, kterou jsme postavili my.** Web zacina tim nejvetsim misto nejmensim.
- **Vyzaduje hodne cteni a vysoke IT vedomosti.** Cilovku (ne-tech majitele) to zamestnava, jde to proti slibu "ulehcim vam".

### Realny obchodni model (co web ma simulovat)
Maly prvni krok s rychlou hodnotou -> postupne vic a vic (jako u MHA). Klient se sam rozroste. Web ma vest k malemu zacatku, ne k nejvetsimu balicku.

### IT governance (50k/mesic)
**Webem se neproda. Nikdy.** Je to honeni ega. Patri dolu / skryte jako moznost "az mi nevyhovuje nic mensiho / chci neco velkeho". NE jako hlavni nabidka.

---

## 2. Novy princip: interaktivni rozcestnik

Misto dlouhych textu -> **clovek klikne "co resim" a vyskoci na nej RESENI**. Nemusi cist vsechno.

### Architektura (rozhodnuto)
- **Jedna rovina dlazdic "co resis"** (ne dva toky komplexni/rychly napred - clovek nevi, jestli je "velka firma")
- Seznam vstupu navrzen **od nuly** (ne lpet na 6 pain kartach)
- Po kliku na dlazdici: **reseni + popis hodnoty + orientacni cena + example + CTA**

### Co web sam o sobe ma dokazovat
Web = dukaz, ze Petr je dobry. Chytry, interaktivni, zabavny, intuitivni. "Ty vole, jak tohle vymyslel" = reklama sama o sobe. Soucasny staticky web podvedome rika "abych z nej dostal hodnotu, bude me to stat praci" - to jde proti slibu.

### Klicovy insight (Petruv priklad)
Nemichat zargon. Misto "jsem Product Owner, delam backlog" -> lidska odpoved na interakci: *"Premyslis o nove aplikaci? Pomuzu ti dat dohromady zadani, vyberu dodavatele, odridim to."* Vyznam sluzby se "rozpusti" a poda jinym zpusobem - jako odpoved na to, co clovek prave kliknul.

---

## 3. Vstupni dlazdice (rec majitele, ne nazvy sluzeb)

| # | Dlazdice (co si majitel pomysli) | Co je za tim (interne) | Orientacni cena |
|---|---|---|---|
| 1 | "Nevim, jak na AI" | AI Assessment (vstupni bod, levny hacek) | **15 000** (single, zruseno Light/plny) |
| 2 | "Premyslim o nove aplikaci nebo systemu" | Product Discovery + vedeni | Discovery ~50k, projekt dle rozsahu |
| 3 | "Porad neco rucne prepisujeme" | Propojeni systemu / automatizace | 10k/den |
| 4 | "Projekt nam utika" | Projektove rizeni / zachrana | 10k/den |
| 5 | "Platime za IT a nevime za co" | IT revize | individualne |
| 6 | "Lidi nepouzivaji, co mame" | Zavadeni nastroju + zaskoleni | 10k/den |
| 7 | "Chci web" | Weby (ZATIM NECHAT - nejasny smer, zadne reference) | ~30k |
| 8 | "Bojim se o bezpecnost a data" | Bezpecnostni revize | individualne |

Pod dlazdicemi diskretne: **"Resim toho vic / nevim, kam to zaradit"** -> souhrn / governance (velka vec schovana).

### Velke sluzby (schovane, pro 10% co je hledaji)
- Interim project manager / Product Discovery pro vetsi firmy
- IT governance (pausal od 50k) - az kdyz klientovi nevyhovuje nic mensiho

---

## 4. AI Assessment (zavazne zadani 2026-06-01)

- **Cena: 15 000 Kc** (NE 25k - jsme na zacatku, cil je ZISKAT klienta, ne maximalizovat. Po referencich zdrazit.)
- **Jedna verze** - zrusit balickovani Light/plny
- **Format: 2x 1h online call** (1. call: co se pouziva, co lidi delaji; 2. call: dotazy/doplneni), pak vystup
- **NE "2 dny u vas"** - to si klient musi udelat cas, je to hraz
- **Vystup: report s potencialni navratnosti + doporucenim nastroju**
- **Vypichnout JEDNODUCHOST**: "stoji vas to jen dve hodiny online, vic ne"
- **Prejmenovat** - "AI Assessment" lidi nerozumi. (Novy nazev: TODO)

> POZN: tohle resi i blokovany cenovy spor v STATUS.md (drive 21900/31900 nahoru -> ted 15000 dolu).

---

## 5. Example / case study u kazde cesty

- U kazde cesty **orientacni cena + typovy example** (clovek se hned zepta "kolik me to cele bude stat")
- **NE existujici case studies z o-mne.html** (nemichat - o-mne je o-mne)
- Ilustrativni/typove priklady. Napr.:
  - E-shop na miru: projekt kolem 500k - 1M
  - Product Discovery: kolem 50k
  - (presne ceny doladit pozdeji)

---

## 6. Weby (odlozeno)

- Web Quick mozna zrusit (kdo to kdy bude chtit?)
- Mozna jen JEDEN web s malym CMS, ~30k (web na miru s AI)
- Napad zvenci: luxus verze ~75k s vypiplanym designem - ale na tenhle trh nesahnem
- Problem: zadne reference na weby, nejasny smer
- **Rozhodnuto: weby zatim nechat jak jsou, vyresit pozdeji**

---

## 7. Co zustava z copy zmen 2026-06-01 (nepushnuto)

Lidsky ton, zruseni porovnavani, zargon pryc, "reditel" jen jako SEO kotva - VSE PLATI a zapracuje se do redesignu. Konkretne hotovo (lokalne, nepushnuto):
- Hero: "Vase IT starosti si beru za sve", lead bez porovnavani
- 6 pain karet do reci majitele
- Differentiator otocen z "nejsem konzultant" na "co ode me cekat"
- Governance desc bez vendor management/report + ekonomicka veta
- o-mne bio bez shazovani konzultantu
- weby/raynet/ai zruseno porovnavani (agentury, Salesforce/HubSpot)

**Sacred phrase "Konzultanti doporucuji. Ja prebiram rizeni." odstranena z webu** -> nutno aktualizovat CLAUDE.md + PRINCIPLES.md (jeste neudelano).

---

## 8. Stav implementace (2026-06-01)

PROTOTYP POSTAVEN (lokalne, NEpushnuto). Soubory v web/:
- **index-v2.html** - rozcestnik, 3 vrstvy stratifikace:
  - Vrstva 1 "Nejcasteji to zacina tady" (velke tmave): AI, Nova aplikace
  - Vrstva 2 "Casto taky resite" (zelenkave): Propojeni systemu, Zavadeni nastroju
  - Vrstva 3 "Kdyz uz v tom nejakou dobu jste" (male): Projekt utika, Naklady, Bezpecnost, Web
  - Pod tim "Resim toho vic najednou" -> vedeni-it (governance schovana)
- **9 detail stranek** (reseni-*.html): ai, nova-aplikace, propojeni, nastroje, projekt, naklady, bezpecnost, web, vedeni-it
  - Format kazde: hero split (pribeh + prodejni karta s cenou) -> proces 3 kroky -> co dostanete 4 polozky -> zaver CTA
  - Vzor = reseni-ai.html (nejtezsi na prodej, postaveno prvni)

DESIGN: vlastni inline CSS v kazdem souboru (prototyp), drzi brand tokeny (EB Garamond + Inter, bezova/zelena). Distinctive v kompozici (asymetrie, stratifikace, hloubka), ne v fontech. Flip karty ZAMITNUTY (malo mista, vse stejne) -> nahrazeno detail strankami.

VERIFIKACE: vse ASCII-clean (typografie), diakritika OK, prokliky funkcni, server servíruje. Nahled: localhost:8773/index-v2.html

GOTCHA: pri generovani agenty 4 stranky mely smazanou ceskou diakritiku (agenti spatne pochopili ASCII-only pravidlo = jen typografie, NE diakritika). Opraveno rucne. Pri pristim dispatchi agentu na cesky obsah EXPLICITNE rict "diakritiku zachovej".

## 8b. Deep-research zaver (2026-06-01) + aplikovano

Deep-research (105 agentu, NN/g primarni zdroje + Gartner/Forrester) na 4 otazky:

1. **MENU vs ROZCESTNIK** [high confidence, NN/g]: Rozcestnik dlazdic JE validni navigace (ne anti-pattern), ALE web NESMI byt bez zadneho menu. Skryta nav (hamburger desktop) / nulove menu = skodi (-39% rychlost desktop, -20% discoverability, duveryhodnost). -> APLIKOVANO: pridano "Sluzby" do nav homepage (kotva na #sluzby). Detail stranky maji jen logo+O mne+Kontakt (single-goal, nav osekana = vyssi konverze, to je SPRAVNE).

2. **CENY** [high]: Uplne skryti skodi (kupujici odejde misto aby se ptal, 67% B2B chce cenu pred kontaktem). ALE holé "individualne" = nejslabsi. Lepsi: rozsah / "od X" / value framing (kmosek.com: "zlomek nakladu kmenoveho zamestnance"). -> APLIKOVANO: revize "od 30 000", propojeni "40-100 tis.", projekt/nastroje/bezpecnost "podle rozsahu" (value), AI 15000 pevna, web od 30000. Odstraneno holé "individualne" i "od 10000/den".
   - Ceny per zakazka (od Petra): IT revize od 30k, propojeni 40-100k. Projekt+nastroje: Petr necha na pozdeji per sluzba (ted "podle rozsahu").

3. **SPECIALIZACE** [medium]: Konkretni platforma (Raynet) patri do DETAILU reseni / sekundarni vrstva, NE jako hlavni dlazdice (cilovka 50+ nezna nazvy technologii, osa = problem). -> TODO: Raynet zaclenit do detailu "propojit systemy"/"nastroje", ne vlastni dlazdice.

4. **AGENTURY/PARTNERI** [research NEROZHODL]: Obe varianty (samostatna stranka vs ne) refutovany/nedokazany. Jiste: partnerstvi = smlouva (engagement model, scope, pricing, referral fee 5-20%), to je back-office mimo web. -> ROZHODNUTO (Petr): zatim NERESIT, dodelat hlavni web pro koncove klienty. Partner stranka az bude jasna outreach komunikace (resi se v jine session).

REFUTOVANO (nepouzivat jako dukaz): "od X cena = +15% konverze" (A/B test refutovan), "5-7 polozek menu optimum", "jasna nav zdvojnasobi konverzi", kmosek pouziva klasicke menu (ve skutecnosti ne).

## 9. Dalsi kroky

1. [ ] Petr projde prototyp na lokale, da feedback na system/design
2. [ ] LADENI TEXTU (az po schvaleni systemu) - obsah je zatim "lepsi nez zadny" placeholder
3. [ ] Vymyslet novy nazev pro AI Assessment
4. [ ] Doladit typove examples + orientacni ceny u kazde cesty
5. [ ] Prejmenovat dlazdici "Chci propojit systemy" (resp. potvrdit) - puvodne "Porad neco rucne prepisujeme"
6. [ ] Rozhodnout o webu (Web Quick zrusit? jeden web ~30k? luxus?)
7. [ ] Pri finalizaci: prevest inline CSS do sdileneho stylesheetu, vyresit routing /reseni/* (slozka nebo .html), SEO meta + JSON-LD per detail, og:image
8. [ ] Aktualizovat CLAUDE.md + PRINCIPLES.md (sacred phrase odstranena, nova struktura nabidky/funnel)
9. [ ] Migrovat copy zmeny z 2026-06-01 (lidsky ton) tam, kde maji zustat (o-mne, kontakt)
10. [ ] Push az cely redesign hotov a schvalen
