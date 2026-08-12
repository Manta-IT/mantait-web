# Blog modul Manta IT -- success criteria (WH1)

Navazuje na `README.md` v tomto adresari. Overeni je rucni/skriptove (staticky
web bez test frameworku, zadny existujici test runner v repu) -- konzistentni
s tim, jak uz `CLAUDE.md` webu definuje pre-commit checklist (ASCII grep,
console errors, mobile viewport). "Hotovo" = vsechny radky nize splneny.

## Functional

| ID | Kriterium | Jak overit |
|---|---|---|
| F1 | `/clanky/` vraci HTTP 200 a vypisuje vsechny clanky z `clanky/manifest.json`, serazene sestupne dle `date_published` (nejnovejsi prvni) | Otevrit `/clanky/` vedle `manifest.json`, porovnat poradi a pocet karet |
| F2 | Kazdy zaznam v `manifest.json` ma presne odpovidajici `.html` v `clanky/`, `<url>` v `sitemap.xml` a radek v `llms.txt` -- 1:1:1:1, zadny chybejici ani navic | Rucni pruchod (pri <10 clancich trivialni); viz README "Otevrene body" pro budouci automatizaci |
| F3 | `clanky/_template.html` existuje a obsahuje vsech 8 skupin povinnych prvku z README sekce 3 (meta sada, JSON-LD Article, nav, hero+byline, telo s citacnim vzorem, interni odkaz, CTA blok, footer) | Checklist proti README sekci 3, kazda polozka odskrtnuta |
| F4 | `manifest.json` je validni JSON a kazdy zaznam ma vsechna povinna pole (`slug`, `title`, `description`, `date_published`, `date_modified`, `highlight`) dle schematu v README sekci 5 | `python -c "import json,sys; json.load(open('web/clanky/manifest.json'))"` neselze + rucni diff schematu |
| F5 | `scripts/gen_clanky_index.py` spusteny nad manifestem s N zaznamy vyprodukuje N karet uvnitr oznaceneho bloku `clanky/index.html`, zbytek souboru se nemeni | Pridat testovaci zaznam do manifestu, spustit skript, `git diff` ukazuje zmenu jen uvnitr `<!-- CLANKY:START -->...END -->` |
| F6 | Publikace noveho clanku = presne kroky 1-9 z README sekce 6, zadny dalsi rucni zasah (napr. rucni uprava `index.html` mimo generovany blok nebo `style.css`) | Projit checklist na zkusebnim clanku, zaznamenat pocet a typ kroku, 0 odchylek |
| F7 | `web/.assetsignore` obsahuje `specs/` a `clanky/_template.html` -- planovaci a sablonovy soubor se nenasazuji na produkci | Lokalni `wrangler dev` nebo produkcni request na `/specs/blog/README` a `/clanky/_template` vraci 404 |

## SEO / performance

| ID | Kriterium | Jak overit |
|---|---|---|
| S1 | Kazdy publikovany clanek ma kompletni meta sadu (title/description/canonical/OG/twitter:card) a JSON-LD `Article` se vsemi povinnymi poli z README sekce 3 | Google Rich Results Test (nebo schema.org validator) na URL clanku -- 0 chyb pro typ Article |
| S2 | Lighthouse SEO skore >= 95 pro kazdy clanek i pro `/clanky/` index (Chrome DevTools, desktop) | Lighthouse audit pred kazdym publikovanim, soucast pre-commit checklistu |
| S3 | Kazdy clanek ma presne jeden `<h1>` a zadne preskoceni nadpisove hierarchie (h2 nikdy rovnou na h4 apod.) | DevTools/axe kontrola nebo rucni prohlidka poradi nadpisu |
| S4 | Kazdy clanek obsahuje minimalne 1 kontextovy interni odkaz na `/dotace-mas` nebo `/reseni-*` v tele textu, mimo `.lp-price` CTA blok | `grep -oE 'href="/(dotace-mas|reseni-[a-z-]+)"' clanky/<slug>.html`, potvrdit >=1 vyskyt mimo CTA divy |
| S5 | `sitemap.xml` obsahuje zaznam noveho clanku s `lastmod` = datum publikace, zmena je soucasti stejneho commitu/dne jako publikace clanku | `git log` -- commit pridavajici `clanky/<slug>.html` obsahuje i zmenu `sitemap.xml` |
| S6 | `/clanky/` index ma JSON-LD `Blog` schema s polem `blogPost`, jehoz pocet polozek odpovida poctu clanku v `manifest.json` | Schema.org validator na `/clanky/`, pocet `blogPost` polozek = pocet zaznamu v manifestu |

## Workflow

| ID | Kriterium | Jak overit |
|---|---|---|
| W1 | ASCII-only kontrola vraci 0 hitu na novem clanku i prepsanem indexu pred kazdym commitem | `grep -P '[\x{2010}-\x{2015}\x{2018}-\x{201F}\x{2026}]' web/clanky/*.html` (existujici prikaz z `CLAUDE.md`) |
| W2 | 0 console errors v DevTools na `/clanky/` i na kazdem novem clanku, desktop 1280px a mobile 600px | Rucni prohlidka pred commitem (existujici sitewide pozadavek, rozsireny na blog) |
| W3 | `scripts/bump-cache.py` po spusteni aktualizuje `?v=` hash na novem clanku i na indexu | Spustit skript, `grep 'style.css?v=' web/clanky/<slug>.html`, hash odpovida `git log -1 --format=%h` |
| W4 | Novy clanek je soucasti stejneho push na `master`, ktery ho zverejni -- zadny "draft" stav na verejne dostupnem URL | Shoduje se s existujicim deploy modelem (push=deploy), zadna zvlastni draft-vetev pro clanky |
| W5 | Kazdy krok publikacniho checklistu (README sekce 6, kroky 1-9) ma jasneho vlastnika (clovek / Claude session / skript) a nevyzaduje rozhodnuti mimo tuto specifikaci nebo `TASKS.md` WH3 | Projit checklist, u kazdeho kroku oznacit vlastnika, 0 nejasnych bodu |

## Co se nemeri (vedomy zaber v1)

RSS, stitky, strankovani, komentare, vyhledavani, vicejazycnost clanku a
per-clanek obrazky nemaji kriteria, protoze jsou explicitne mimo scope v1
(README sekce 8). Kdyby se nektera z techto veci pridala pozdeji, dostane
vlastni sadu kriterii v momente, kdy se do specifikace dostane.
