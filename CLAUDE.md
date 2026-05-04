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

## Design system (drz konzistentni)
- **Barvy:** pozadi `#0a0a0a` (pozor: spec uvadi `#080808` -- v kodu je `#0a0a0a`, drz to co je v `index.html`), zlaty akcent `#C9973A`.
- **Fonty:** Cormorant Garamond (display/headings), DM Sans (body) -- nactene z Google Fonts.
- **Breakpointy:** 900px, 600px.
- **Tonalita copy:** primocara, sebevedoma, bez buzzwordu. Klicova veta: *"Konzultanti doporucuji. Ja prebiram rizeni."*

## Struktura stranky (Layout B, 6 sekci)
Hero -> Mozna resite (3 scenare) -> Jak spoluprace probiha (4 kroky) -> Zpusoby spoluprace (3 karty: 8-10k/den, retainer od 50k/mes, revize) -> Proc to neni konzultant -> Kontakt.

Spec: `../docs/superpowers/specs/2026-04-10-mantait-web-design.md` (schvaleno).

## Znamy stav / placeholders
- Telefon `+420 000 000 000` -- placeholder.
- ICO `00000000` -- placeholder.
- OG meta tagy chybi (title/description hotove).
- Bio + foto Petra a case studies -- zatim ne (UX review doporucuje pridat; spec puvodne vylucoval -- novejsi doporuceni vitezi).

Aktualni action list a blockers viz `STATUS.md`. Kontext a souvislosti viz `CONTEXT.md`.

## Souvislosti
- **Parent workspace:** `../` (`ventures/manta-it/`) -- branding, lead gen pipeline, market research.
- **Lead gen system:** outreach (LinkedIn DM, email) vede na tento web -- web je vizitka pro cold prospekty, kvalita prime ovlivnuje konverzi.

## Konvence
- ASCII-only v HTML (zadny em-dash, smart quotes, ellipsis -- renderuji se rozbite v nekterych prohlizecich/encodingu pri spatnem charsetu).
- Pri zmene textu na strance overit soulad s positioning v parent `manta-it/CONTEXT.md`.
- Pri zmene struktury / sekci aktualizovat `STATUS.md` (action list) a `CONTEXT.md` (Co chybi / TODO).
