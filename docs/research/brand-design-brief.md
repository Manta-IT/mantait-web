# Brand Design Brief — Manta IT logo

> **PŘEKONÁNO 27. 8. 2026 redesignem.** Platný zdroj vizuálu je skill
> `manta-brand` (papír #FBFBF9, inkoust #101413, jediný akcent zelená #0B6E4F,
> Outfit + Manrope, značka = zelená dlaždice s výřezem, žádný serif a žádné
> písmeno M). Paleta, písma i logo koncepty níže jsou stav do 26. 8. 2026 --
> dokument zůstává jako historie rozhodování, nic nového se podle něj nestaví.

> Vytvořeno 2026-05-26. Tohle byl brief poslaný frontend-design subagentovi pro 1. iteraci. Výsledek = `brand-lab.html` (5 konceptů). Petr v 1. kole nevybral žádný, **pokračujeme v dalších iteracích**.

## Brand context

**Název:** Manta IT
**Slogan / akronym:** "Management through AI" — MANTA rozšifruje:
- **MAN**agement
- **T**hrough
- **AI**
- + IT (tech segment)

**Hříčka:** Akronym MANTA je už v názvu MANT**a** **i**t. Písmena "A" + "I" (= AI) jsou napřič mezerou mezi MANTA a IT. Důležitý vizuální motiv k obyhrávání.

**Cílovka:** Ne-tech SMB CEO 50-300 lidí v ČR, 50+ let, nesnášejí IT žargon. Profesionální, warm, sebevědomá značka.

**Sacred phrase:** "Konzultanti doporučují. Já přebírám řízení."

## Design vize (Petr)

> "Symbol = digitalizovaná továrna. Klasická ikona průmyslu (továrna s ostrými střechami a komínem). Půlka je v brand barvách (zelená), druhá půlka je digitalizovaná - prolezlá tištěnými spoji (PCB) nebo synaptickými noudy (jako obraz elektronického mozku s nápisem AI). Symbolizuje že přinášíme nuly a jedničky / software / pokročilý hardware do tradičního průmyslu."

### Klíčové prvky
1. **Půlka klasická továrna** (zubaté střechy, komín) — vizuální shortcut pro "průmysl"
2. **Půlka digitalizovaná** — pixely, PCB stopy, synapse, dots, nodes — shortcut pro "AI/digital"
3. **Spojení obou** je esence brandu — left = world before AI, right = world after, Manta IT = bridge

## Brand barvy (web paleta)
```
--accent:       #2d5447   /* hluboká zelená - hlavní */
--accent-warm:  #c9b88a   /* teplá zlato - pro pixely / AI vrstvu */
--text:         #16201d   /* tmavá - pro typografii */
--bg:           #f1ede4   /* béžová - background */
--bg-card:      #f8f5ec   /* světlá béžová - card background */
```

## Typografie
- "Manta IT" wordmark: **Cormorant Garamond** (serif, 500/600)
- "Management through AI" slogan: **Inter** (sans-serif, 400/500, letter-spacing 0.1em pro uppercase)

## První iterace (Brand Lab v1, hotovo 2026-05-26)

Subagent vytvořil `brand-lab.html` (55 KB, jeden soubor). 5 konceptů × 6 variant = 30 SVG inline:

### Koncept 01: The Pixelated Factory
Vertikální split. Levá pulka solid zelená továrna. Pravá pulka stejná silueta jako PCB dot pattern v zlaté. **Nejdoslovnější** interpretace briefu.

### Koncept 02: Smokestack Synapse
Horizontální split. Továrna dole. Z komínu stoupá neural network směrem nahoru. **Nejvíc narativní** ("starý průmysl produkuje data → AI").

### Koncept 03: AI Cipher
Typo-architektura. Písmeno "A" = hřebenová střecha s crossbarem. "I" = komín se serif patkou. Zarámované v PCB obvodu. **Nejchytřejší** vizuální hříčka s AI motivem.

### Koncept 04: Phase Transition
Outline továrna. Stroke se zleva doprava promenuje (solid → dashed → dotted → discrete dots). **Nejvíc design-forward**, abstraktní.

### Koncept 05: MANT·AI·T Wordmark
Čistý typografický. "MANTA IT" v Cormorant, PCB connector zvýrazňující "AI" uprostřed. **Nejvíc dospělý**, minimal.

### Co bylo zahozeno
- Koncept "Monogram M" — broken (M má 2 vertikální čáry, ne 3, nesedí jako 3 komíny).

### Architektura kódu (zachovat pro v2)
- `<symbol>`/`<defs>` v hlavní knihovně, varianty jen `<use>` + CSS variables (`--c-solid`, `--c-dots`)
- Dark/mono varianty = stejný symbol, jen přebarvené
- PCB pattern via `<pattern>` element s opakujicimi se tečkami a connectory
- Editorial Brand Lab page: oversized italic Cormorant 132px, monospace meta-labely, paper noise grain overlay

## Petrova zpětná vazba (2026-05-26)

> "Tohle s logama je to dobrý start, ale ani jedno se mi nelíbí."

**Nedořešeno — proč:** Petr nespecifikoval konkrétní důvod. Pro v2 iteraci by se mu mělo zeptat:
- Co konkrétně mu nesedí? Faktorová analýza (symbol moc literální? typografie? barvy? proporce?)
- Líbí se mu některý z konceptů aspoň částečně (např. typo z 5 + symbol z 3)?
- Chce úplně jiný směr (např. abstract emblem, monogram, modern minimalist)?
- Jak důležitá je "továrna" doslovně vs metaforicky?

## Brand Lab v2 — doporučený postup

1. Zeptat se Petra na konkrétní feedback k v1 (viz výše).
2. Připravit 3-5 nových konceptů jdoucích jiným směrem než v1. Možnosti:
   - **Abstract emblem** — žádná továrna, jen geometrický symbol (např. M vplývající do AI)
   - **Pure typography** — wordmark jako hlavní logo, žádný symbol
   - **Hybrid badge** — kombinace iniciál + jemného grafického prvku
   - **Industrial modernist** — bauhaus-style, geometrické tvary
   - **Tech glyph** — jeden minimalistický znak co reprezentuje "AI v průmyslu"
3. Zachovat web paletu + typografii (Cormorant + Inter).
4. Brand Lab page strukturu zachovat (editorial design je dobrý).

## Po výběru loga — deliverables (TODO #89)

Až bude logo finalizované:
- Email podpis (HTML + plain text)
- Favicon (SVG + ICO + 192px + 512px PNG pro PWA)
- og:image (1200×630, branded)
- LinkedIn cover image + profile picture
- Smlouva template (Word/PDF)
- Nabídka template
- Objednávka template
- Prezentace template (PowerPoint/Keynote/Google Slides)
- Brand guidelines dokument (paleta, typografie, gap rules, dont's)
- Update favicon ve všech 6 HTML stránkách webu
