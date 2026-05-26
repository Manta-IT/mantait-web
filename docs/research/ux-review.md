# UX Review (čitelnost pro 50+ cílovku)

> Subagent UX review výstup, 2026-05-26. Audit `style.css` (2050 řádků) napříč 6 stránkami. Kontrasty: přibližné, sRGB gamma-korigované. Cíl: WCAG AA (4.5:1 body, 3:1 large text) minimum, AAA (7:1) doporučeno pro brýle na blízko.

## Klíčový závěr

**Šedý `--text-faint #7a8782` na světlém pozadí kontrast 3.1–3.4:1 — selhává WCAG AA na všech 3 světlých pozadích.** Plus 11–13px velikosti to znásobují.

Tohle bylo aplikováno 2026-05-26: `--text-faint` ztmavněno na `#5d6a66`, `--text-muted` ztmavněno na `#2e3835`, nový `--text-secondary #3a4744`. **Stále zbývá projít konkrétní selektory** (níže) a nahradit `--text-faint` v textu za `--text-muted`/`--text-secondary`.

## 1. Font size issues (zbývá fixnout)

| Selector | Aktuální | Použito kde | Problém | Doporučení |
|---|---|---|---|---|
| `.footer-trust` | 12px text-faint | footer všech stránek | 12px + 3.25:1 | 14px, text-muted, weight 500 |
| `.governance-format`, `.product-card-format`, `.ai-card-format`, `.retainer-format` | 12px text-faint UPPERCASE | homepage, ai.html | 12px caps, 3.25:1 | 13px, ztmavit na text-muted |
| `.service-price small`, `.hero-attribution`, `.contact-item-label` (11px), `.ref-meta-k` (11px) | 11–12px text-faint | services, hero, kontakt, reference | nečitelné na blízko | 13px + text-muted |
| `.label`, `.product-card-tag`, `.specializace-tag`, `.ai-card-tag`, `.subservice-bullets-label`, `.service-bullets-label`, `.ai-card-deliverable-label` | 11px UPPERCASE | všude (eyebrow labely) | 11px + letter-spacing 1.5–2.5px | 12px; nech accent barvu (kontrast OK), tam kde text-faint → text-muted |
| `.subservice-price-unit` | 11px text-faint UPPERCASE | homepage karty | nejhorší kombinace | 12px text-muted |
| `.service-bullets li` (13px), `.subservice-bullets li` (13px), `.ai-card-deliverable` (13px), `.ref-item-desc` (13px), `.ref-meta-v` | 13px text-muted | sluzby/subservices karty, reference | klíčové bullety nečitelné | 14px minimum, ideál 15px |
| `.pain-card-body`, `.service-desc`, `.subservice-desc`, `.product-card-desc`, `.specializace-desc`, `.usecase-desc`, `.ai-card-desc`, `.ref-case-body`, `.faq-answer` | 14px text-muted | všech 6 stránek (hlavní body v kartách) | spodní hranice pro 50+ | **15–16px** (Apple HIG body min 17pt) |
| `.hero-reassure`, `.contact-note` | 13px text-faint italic Cormorant | homepage, kontakt | 13px + italic + 3.25:1 — nejhorší | 15px text-muted, weight 500, ne italic |
| `.footer`, `.footer-meta` | 13px text-faint | všechny stránky | 3.25:1 | 14px text-muted |
| `.hero-lead` (17px), `.bio-lead` (17px), `.page-header-sub` (18px) | OK | hero/o-mne | OK kontrast i velikost | bez změny |

## 2. Color contrast issues

Pozadí: `--bg #f1ede4`, `--bg-alt #ebe5d6`, `--bg-card #f8f5ec`, `--bg-dark #16201d`.

| Token | FG | BG | Ratio | WCAG | Fix |
|---|---|---|---|---|---|
| `--text-faint` | #7a8782 → #5d6a66 | #f1ede4 | 3.2:1 → ~5:1 | FAIL → AA (po fix) | **Nepoužívat pro text. Pouze hairlines/dividers.** Aplikováno teoretiky, treba dale prejit selektory. |
| `--text-muted` | #485854 → #2e3835 | #f1ede4 | 6.2:1 → ~10:1 | AA → AAA (po fix) | OK pro body 16+, pro 13–14px ztmavit |
| `--text` | #16201d | bg/bg-card/bg-alt | 14–15:1 | AAA | OK |
| `--accent` | #2d5447 | bg | 6.7:1 | AA, near AAA | OK pro nadpisy/CTA |
| `--accent-warm` | #c9b88a | #16201d | 8.6:1 | AAA | OK (dark sections) |
| `--text-on-dark-faint` | rgba(241,237,228,0.5) | #16201d | ~4.4:1 | borderline AA | Použito v `.governance-format`, `.diff-attribution`, `.hero-attribution` — **zvýšeno na 0.65** ✓ |
| `.bio-photo-name` | rgba(22,32,29,0.6) | #c9b88a | ~3.0:1 | FAIL AA | plný `--text` nebo ztmavit pozadí monogramu |

**Fixy provedené 2026-05-26:**
- `--text-muted` ztmavněno na `#2e3835` ✓
- `--text-secondary #3a4744` přidán ✓
- `--text-on-dark-faint` zvýšeno na 0.65 ✓

**Stále zbývá:**
- Projít selektory v tab. 1 a nahradit `--text-faint` za `--text-muted` v textových rolích
- Fix `.bio-photo-name` na plný `--text`

## 3. Mobile readability (≤600px)

**Co funguje:**
- Hero headline 36px, sekce 30px — OK
- Karty 1 sloupec — OK
- `--pad-section` 60px na mobile — OK

**Problémy:**
- Body 14px na mobilu neškáluje nahoru. Brýle = problém.
- **Nav `<1100px` skryto bez hamburgeru** ← **FIXED 2026-05-26**: implementován CSS-only hamburger toggle s checkbox+label trick ✓

**Tap targets (WCAG 2.5.5 = 44×44px):**

| Element | Výška | Stav | Po fix |
|---|---|---|---|
| `.btn` (14px + 14px padding) | ~46px | OK | OK |
| `.nav-cta` | 32px | FAIL | **FIXED → 44px min-height** ✓ |
| `.product-card-btn-primary/secondary` | 32px | FAIL | **FIXED → 44px min-height** ✓ |
| `.hero-cta-secondary` | ~42px | hraniční | ponecháno |
| `.nav-link` (s nav padding 22px) | OK desktop | OK | OK |
| `.faq-question` | static text | n/a | n/a |
| `.specializace-card`, `.product-card`, `.subservice-card` | 36px+ padding | OK | OK |

## 4. Visual hierarchy issues

1. **Karta = 4 podobné fonty Cormorant vedle sebe.** Příklad `.subservice-card`:
   - `subservice-num` 14px CG accent letter-spaced
   - `subservice-name` 24px CG text
   - `subservice-tagline` 16px italic CG accent ← **zní jako podnadpis, ale je to slogan**
   - `subservice-desc` 14px Inter muted
   - **Doporučení:** tagline změnit na Inter italic 14px text-muted, nebo úplně odstranit. **Zatím nefixnuto.**

2. **Footer:** 3 různé velikosti (12px footer-trust, 13px footer-meta, 18px footer-brand) všechny šedivé text-faint kromě brand. Hierarchie nečitelná. Zvýraznit brand, ostatní ztmavit. **Zatím nefixnuto.**

3. **`.service-row`** (3 sloupce: name 26px CG / desc 14px Inter / price 24px CG). Cena a název mají skoro stejnou velikost. Cenu zvětšit na 28px nebo na vlastní řádek. **Zatím nefixnuto.**

4. **`.ref-case-meta`** 11px UPPERCASE text-faint klíče + 16px CG hodnoty — klíče nečitelné. Klíče 13px text-muted. **Zatím nefixnuto.**

5. **`.contact-details`** label 11px text-faint UPPERCASE + value 22px CG — největší disproporce. Label 13px text-muted. **Zatím nefixnuto.**

6. **Eyebrow + headline rytmus konzistentní** — drží. Nezasahovat.

## 5. Italic Cormorant usage review

**Pravidlo:** italic CG funguje jako *akcent ve velkém headline* (28px+) nebo jako *standalone quote*. Jako *subtitle pod jménem karty* zní vždy jako druhá vrstva titulku.

**4 místa porušující toto pravidlo (zatím nefixnuto):**
- `.subservice-tagline` 16px italic CG accent — vypadá jako podtitul služby
- `.product-card-subtitle` 16px italic CG text-muted — vypadá jako pokračování názvu
- `.ai-card-subtitle` 17px italic CG text-muted — totéž
- `.bio-photo-name` 18px italic na barevném pozadí — kontrast + italic na barevném

**Doporučení:** odstranit italic + změnit na Inter 14-15px regular text-muted.

## Top 10 priority fixes (stav 2026-05-26)

| # | Fix | Stav |
|---|---|---|
| 1 | **Zrušit `--text-faint` jako barvu textu.** Cca 20 selektorů. | částečně ✓ (token ztmavněn, ale selektory ne) |
| 2 | **Body text z 14px → 15–16px** v kartách | **TODO** |
| 3 | **Mobilní navigace — hamburger** | **DONE ✓** |
| 4 | **`.hero-reassure` a `.contact-note`** přepsat: 15px Inter weight 500 text-muted | **TODO** |
| 5 | **Bullety v kartách 13px → 14–15px**, ztmavit | **TODO** |
| 6 | **11px labely → 12–13px**, použít accent nebo text-muted | **TODO** |
| 7 | **Tap target `.nav-cta` a `.product-card-btn-*`** | **DONE ✓** |
| 8 | **Odstranit italic Cormorant subtitle** ze 4 karet | **TODO** |
| 9 | **Footer 12–13px text-faint → 14px text-muted** | **TODO** |
| 10 | **`.bio-photo-name`** plný `--text` (ne rgba 0.6) | **TODO** |
