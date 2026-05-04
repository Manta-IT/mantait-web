# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Co to je
Staticka landing page pro **Manta IT** -- jeden soubor `index.html` (HTML + inline CSS, zadny JS framework, zadny build step). Zatim nepublikovano.

V komunikaci pouzivej brand **Manta IT**.

## Workflow
- **Editace:** primo `index.html` (CSS je inline v `<style>`).
- **Preview:** otevri `index.html` v prohlizeci (file://) nebo `python -m http.server` v adresari `web/`.
- **Build / test / lint:** zadny -- staticky HTML.
- **Deploy:** zatim nerozhodnuto (kandidati: GitHub Pages, Vercel, Netlify). Domena `mantait.cz` -- stav neoveren.

## Release workflow (po publishi)
Web zije na masteru. Kazda zmena = jeden commit = jeden release-bod.

1. **Drobna zmena** (text, font-size, drobny styling): edituj `index.html` primo na masteru, commitni s popisnou zpravou (`feat`/`fix`/`chore`/`refactor` prefix), pushni.
2. **Vetsi zmena** (nova sekce, redesign, restruktura): vytvor feature branch (`web-<feature>`), iteruj, smerge do masteru po overeni v prohlizeci.
3. **Pred kazdym commitem:** otevri `index.html` v prohlizeci, projdi celou stranku desktop + 800px + 400px sirku.
4. **Rollback:** kazdy commit je obnoveni-bod (`git checkout <SHA> -- web/index.html`).
5. **Hosting** (po vyresnem hostingu): push na master = automaticky deploy. Bez kontaminace zadnym build krokem.

## Design system (drz konzistentni)
- **Paleta:** pozadi `#f1ede4` (bezova), alt `#ebe5d6`, card `#f8f5ec`, dark accent section `#16201d`. Akcent: hluboka zelena `#2d5447`, na tmavem pozadi tepla bezo-zlata `#c9b88a`.
- **Fonty:** Cormorant Garamond (display/headlines, vahy 400/500/600 + italic 500/600), Inter (body, navigation, eyebrow, CTA -- vahy 400/500/600).
- **Breakpointy:** 900px, 600px.
- **Tonalita copy:** primocara, sebevedoma, bez buzzwordu. Klicova veta: *"Konzultanti doporucuji. Ja prebiram rizeni."*
- **Italic em pro duraz:** misto bold/uppercase pro klicova slova v headlinech (napr. "*posouvat*", "*Jiny vysledek*"), barveno akcentem.
- **Vizualni rytmus pasu:** svetla -> alt bezova -> svetla -> alt -> tmava -> alt -> footer. Tmava sekce pouze "Proc to neni konzultant".

## Struktura stranky (6 sekci)
Hero -> Mozna resite (3 scenare) -> Jak spoluprace probiha (4 kroky) -> Zpusoby spoluprace (3 radky: 8-10k/den, retainer od 50k/mes, revize) -> Proc to neni konzultant (tmava) -> Kontakt.

Aktualni spec: `../docs/superpowers/specs/2026-05-04-mantait-web-redesign-warm-professional.md` (nahrazuje 2026-04-10 dark/gold spec, ten zustava jako historicka reference).

## Znamy stav / placeholders
- Telefon `+420 000 000 000` -- placeholder.
- ICO `00000000` -- placeholder.
- Vizualni redesign warm-professional dokoncen 2026-05-04. Backup puvodni dark/gold verze: `web/index.html.dark-gold-backup` (po mergi do master smazat -- v git historii zustava).
- OG meta tagy doplneny 2026-05-04 (og:title, og:description, og:type).
- Bio + foto Petra a case studies -- zatim ne (faze 2 po publishi; UX review doporucuje pridat).

Aktualni action list a blockers viz `STATUS.md`. Kontext a souvislosti viz `CONTEXT.md`.

## Souvislosti
- **Parent workspace:** `../` (`ventures/manta-it/`) -- branding, lead gen pipeline, market research.
- **Lead gen system:** outreach (LinkedIn DM, email) vede na tento web -- web je vizitka pro cold prospekty, kvalita prime ovlivnuje konverzi.

## Konvence
- ASCII-only v HTML (zadny em-dash, smart quotes, ellipsis -- renderuji se rozbite v nekterych prohlizecich/encodingu pri spatnem charsetu).
- Pri zmene textu na strance overit soulad s positioning v parent `manta-it/CONTEXT.md`.
- Pri zmene struktury / sekci aktualizovat `STATUS.md` (action list) a `CONTEXT.md` (Co chybi / TODO).
