# Manta IT web -- Code Review

Audit date: 2026-05-26. Files reviewed: `index.html`, `o-mne.html`, `ai.html`, `weby.html`, `raynet.html`, `kontakt.html`, `style.css`, `sitemap.xml`, `robots.txt`, `llms.txt`. Senior bar from `web/CLAUDE.md` + `web/PRINCIPLES.md`.

## Verdict

Senior bones, vibe-coded surgery needed. Stack is the right call (no framework, no build), structure is consistent across pages, SEO and structured data show real care -- but a handful of specific defects (mobile nav vanishes, broken anchor in the hero CTA, `<a>` wrapping `<button>`, hardcoded Calendly URL 36 times, render-blocking third-party CSS on 5 of 6 pages) say "shipped before review." Two evenings of disciplined fixes and this is exactly the artifact Petr's quote describes.

## Top 10 priority fixes

1. **Mobile nav disappears below 900px, no hamburger replacement.** `style.css:2025-2027` hides `.nav-links` from 1100px down; `style.css:2029-2038` re-shows it for 901-1100px. Below 901px the user sees only logo + CTA -- no way to reach `/ai`, `/weby`, `/raynet`, `/o-mne`, `/kontakt` except by going to `/` first. CLAUDE.md states "Tap targets >= 44px (Petr pozaduje mobile UX)" -- a missing mobile menu is the more fundamental form of that miss. Add a hamburger toggle (CSS-only checkbox hack or 10 lines of JS).
2. **`og:image` and `twitter:image` are missing on every page.** `twitter:card` is set to `summary_large_image` on all 6 pages (e.g. `index.html:13`) but no image URL is provided. Result: LinkedIn / Facebook / Twitter shares render empty cards. Direct funnel hit for a B2B brand. Even shipping a 1200x630 PNG with the brand mark would be enough.
3. **Broken anchor in homepage hero CTA.** `index.html:176` links to `href="#process"`. The section is `id="proces"` (`index.html:435`). The secondary CTA "Jak spoluprace probiha" right next to the primary "Domluvit schuzku" does nothing.
4. **`<a>` wraps `<button>` four times -- invalid HTML5, AT failure.** `index.html:557, 574, 600, 617` are `<a href="ai.html" class="product-card">` containing a `<button class="product-card-btn-secondary">` (lines 570, 587, 613, 630). HTML5 forbids interactive content nested in `<a>`; browsers usually salvage it, screen readers don't. `event.stopPropagation()` on the inner button papers over the click conflict but doesn't fix the semantics. Flatten: card body is `<a>`, secondary CTA is a sibling `<button>` outside the link.
5. **`--text-faint` (#5d6a66) used on light background -- breaks WCAG AA and project's own explicit rule.** CLAUDE.md: "--text-faint NIKDY jako text na svetlem pozadi". `style.css:308` (`.hero-reassure`), `:623` (`.service-price small`), `:633` (`.service-bullets-label`), `:895` (`.subservice-row-price-unit`), `:917` (`.subservices-cta-note`), `:977` (`.retainer-format`), `:1210` (`.product-card-format`), `:1476` (`.ai-card-format`), `:1492` (`.ai-card-deliverable-label`), `:1586` (`.contact-item-label`), `:1600` (`.contact-note`), `:1832` (`.ref-meta-k`), `:1869` (`footer`), `:1884`, `:1890` (`.footer-trust`). Most are 11-13px small caps -- exactly the type that needs more contrast. Swap for `--text-secondary` (#3a4744, ~6.5:1).
6. **13x `<a href="#" onclick="...return false;">` for Calendly CTAs.** Lines incl. `index.html:162, 175, 428, 675`, plus the same pattern on `ai.html:114, 350`, `o-mne.html:81, 337`, `weby.html:112, 301`, `raynet.html:100, 344`, `kontakt.html:69`. These open a dialog, they don't navigate. The HTML element for "open a dialog" is `<button>`. `<a href="#">` lies to the address bar, breaks middle-click / open-in-new-tab expectations, and historically fires `hashchange`. The "Domluvit schuzku" nav CTA should be `<button class="nav-cta">`. Same for all `.btn` Calendly triggers.
7. **Calendly CSS render-blocks on 5 of 6 pages.** `<link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">` is in `<head>` of every page (`index.html:23`, `ai.html:21`, etc.). Only `kontakt.html` has the inline Calendly widget that needs the styles upfront. For the other 5 pages, the popup widget loads its own CSS dynamically when triggered -- this preload is dead weight blocking first paint. Remove from index/ai/weby/raynet/o-mne. Keep only on kontakt.html.
8. **Italic Cormorant used as card subtitle -- explicit project rule violation.** PRINCIPLES.md / CLAUDE.md: "Italic Cormorant ... NIKDY jako subtitle pod kartami (cte se jako druhy titulek)." `style.css:1192-1198` (`.product-card-subtitle`) and `:1458-1465` (`.ai-card-subtitle`) both set `font-style: italic` on Cormorant Garamond for what is literally a card subtitle. Used in `index.html` product cards and `ai.html`/`weby.html` pricing cards. Switch to Inter 14-15px, regular weight, `--text-secondary`.
9. **Calendly URL hardcoded 36 times across 6 files.** Same query string (`?hide_gdpr_banner=1&background_color=f1ede4&text_color=16201d&primary_color=2d5447`) repeated in every `onclick` handler. Maintenance trap: when Petr's Calendly Pro upgrade lands (5 TODO comments already in code waiting for per-service event types), this is a 30-edit search-and-replace prone to drift. Extract to one inline `<script>` with `data-calendly-url` attribute pattern, or a tiny `calendly.js`. 15 lines of JS replaces 36 inline handlers.
10. **Dead CSS, ~10 % of file.** Selectors with zero matching markup: `.retainer-box`, `.retainer-inner`, `.retainer-name`, `.retainer-desc`, `.retainer-price`, `.retainer-format` (`style.css:940-983`); `.service-row`, `.service-name`, `.service-desc`, `.service-price`, `.service-price small`, `.service-bullets-label`, `.service-bullets li` (`:587-655` -- only `.service-bullets` itself + `-label` are used inside `.governance-box`); `.btn-secondary` (`:104-112`); `.container` (`:54-58`); `#services h2`, `#services h2 em` (`:555-577`); `#contact` (`:1539`); selector `[id^="quick"]` (`:38`) -- no element matches (web-quick starts with `web-`); `.ai-teaser` referenced in `:1965, :2069` font-size overrides but the class is never declared or used. Delete or salvage.

## 1. HTML quality

Doctype + `lang="cs"` + `meta charset` + viewport meta all correct across 6 pages. Semantic tags used (`<nav>`, `<section>`, `<footer>`) but **no `<main>` and no `<header>` anywhere** -- pages have a `<nav>` directly followed by `<section>`s with no main landmark. Screen readers fall back to "document root" instead of "main content." Wrap everything between `</nav>` and `<footer>` in `<main>`.

Headings: exactly 1 `<h1>` per page (good). On `o-mne.html` the case-study cards (`.ref-case`) use bare `<h3>` (`o-mne.html:267, 287, 307`) inside a parent that has its own `<h2>` (line 149) -- hierarchy OK. On `index.html` the same applies. No skipped levels found.

`<section id="...">` on kontakt.html (`kontakt.html:87`) has no `id`, no `aria-label` -- accessible name missing, also has inline `style`. Wrap with id + label.

Zero `aria-*`, zero `alt=""`, zero `role=""` attributes site-wide. No images so `alt` is moot, but interactive elements lack labels: `.nav-dropdown > .nav-link` (the "Specializace" parent that toggles on hover only) is keyboard-inaccessible -- the dropdown opens on `:hover` or `:focus-within`, but the trigger is an `<a href="index.html#specializace">` so on focus it does open, on Enter it navigates away. Should be a `<button aria-expanded="false" aria-haspopup="menu">` driving an `<ul role="menu">`.

HTML entities are limited to `&middot;`, `&copy;`, `&amp;`, `&rarr;` -- all ASCII-safe per project convention. No `&mdash;`, no smart quotes, no `&hellip;`. Clean.

No duplicate IDs within a single page. `id="kontakt-cta"` appears once per page (5 pages). Fine -- IDs only need to be unique per document.

## 2. CSS quality

Single 2121-line file, organized with section banner comments. Custom-properties palette is consistent and named semantically (`--text`, `--text-muted`, `--text-secondary`, `--text-faint`). Use of `clamp()` for fluid typography is genuinely senior (`style.css:31, 32, 81-83`).

Specificity is mostly flat single-class selectors -- no `!important`, no ID-driven cascades (except the unused `#services`/`#contact`/`#process` block). No specificity wars.

Magic numbers: layout pads (`28px`, `56px`, `var(--pad-section)`) are consistent. But hex `#234436` (`style.css:102, 241, 1240`) is the hover-darker shade of `--accent` and is hardcoded three times -- should be `--accent-dark` token. Same with `#e8e2d3` (`:313`) and `#d8c89a` (`:751`) -- one-off colors that escape the palette system.

Mobile-first vs desktop-first: file is **desktop-first** (defaults are wide-screen, breakpoints `max-width: 900px, 1100px, 600px` narrow them). PRINCIPLES.md doesn't mandate the direction; this is fine, but the `(max-width: 1100px) and (min-width: 901px)` (`style.css:2029`) re-enable block is the kind of patch that screams "this was bolted on after the hamburger was forgotten."

Color/typography tokens used consistently with the exceptions called out in Top 10 (#5). Z-index: only `nav` uses it (`:127`, value 10) -- no z-index wars.

Animation: only `transform` + `opacity` + `background` transitions. No layout-thrashing (`top`/`left`/`width` animations). Good.

Subservice hover effect (`style.css:799-904`) is heavy -- 7 child elements re-color on hover via 7 separate `:hover` selectors. Could be one CSS variable swap on the parent (`--state-color`) referenced by children. Works fine, just verbose.

Heading reset is missing -- `h1, h2, h3` get font-family + line-height but no `margin: 0` reset; the `*` reset on line 4 covers it. OK.

## 3. Performance

`<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` -- **present on `index.html`, `ai.html`, `o-mne.html`, `kontakt.html`. Missing on `weby.html` (`weby.html:17`) and `raynet.html` (`raynet.html:17`).** They jump straight to `preload`. Inconsistent. Add preconnects.

Font request: a single combined CSS2 URL pulling Cormorant Garamond (8 axes!) + Inter (3 weights) with `display=swap`. Smart consolidation. The 8 Cormorant axes (`ital,wght@0,400;0,500;0,600;1,500;1,600`) include weights 400 (`light`, unused -- check the CSS: only 500 and 600 appear) and italic-600 (italic-bold) -- inspect actual usage and trim to 4 axes max. Saves ~30-40 KB.

Calendly CSS render-blocking -- covered in Top 10 #7.

Calendly JS has `defer` (`index.html:24` etc.) -- correct.

CSS file size: 45.8 KB uncompressed, ~8-10 KB gzipped. Acceptable for a 6-page site. Could shed ~5 KB by removing the dead selectors (Top 10 #10).

No images. Favicon is inline SVG (`favicon.svg`, 275 B). Logo is text. No optimisation needed.

Inline JSON-LD on each page is well-formed and reasonably scoped -- ~3-5 KB per page, not a real concern, but `index.html` has the full ProfessionalService + 8-offer catalog block (`index.html:28-141`) which is ~4 KB inline. If page weight matters more, move to a single `/jsonld.json` referenced via `<link>` -- though support for that pattern is uneven, so the current inline approach is the safer call.

No critical CSS inline -- the entire `style.css` is render-blocking. For a 46 KB file with ~6 KB of above-the-fold styles, inlining the hero/nav block would noticeably improve LCP. Not urgent.

## 4. SEO / Meta

Strong overall, with two real misses.

**Per-page unique title + description:** all 6 pages have unique, hand-written, Czech, keyword-targeted titles and ~150-character meta descriptions. Senior-grade.

**Open Graph:** complete on every page (`og:title`, `og:description`, `og:type`, `og:locale=cs_CZ`, `og:url`, `og:site_name`) -- minus the image, see Top 10 #2. `og:type` differentiated correctly: `website` for landing/service pages, `profile` for `o-mne.html` (`o-mne.html:9`).

**Twitter cards:** all 6 declare `summary_large_image`. None provide an image. Either downgrade to `summary` (works without image) or add the image. Mixed signals are the worst option.

**Canonical URLs:** all 6 use absolute `https://mantait.cz/...` form with `.html` extension matching exactly the URLs in `sitemap.xml`. No mix. Good.

**JSON-LD:** correctly typed schemas per page (ProfessionalService on index, Person on o-mne, Service + FAQPage on ai/raynet, Service-only on weby, ContactPage on kontakt). Prices in CZK with proper `priceSpecification` for hourly/monthly. Schema.org validation should pass. The Service blocks on `weby.html:30-50` and `raynet.html:29-39` have no `serviceType` field -- minor.

**llms.txt:** follows the llmstxt.org template (`# Manta IT` + blockquote summary + `## Hlavni stranky` + sections). Compliant. Pricing matches HTML. Solid.

**robots.txt:** allowlists GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, anthropic-ai, CCBot. Sitemap declared. Complete per CLAUDE.md spec.

**sitemap.xml:** valid XML, 6 URLs, `lastmod=2026-05-25`, correct `priority` weighting (homepage 1.0, money pages 0.9, kontakt 0.7). Clean.

## 5. Maintainability

**Nav + footer duplicated verbatim 6 times.** Lines 145-163 of `index.html` ~= lines 64-82 of `o-mne.html` ~= same in `ai.html`, `weby.html`, `raynet.html`, `kontakt.html` (with only `.nav-link.active` swapping). Same for footer (`index.html:694-699` etc.). 19 lines x 6 = ~120 lines of copy-paste. Since the project explicitly rules out a framework / build step, the realistic options are: (a) live with it (current state, ~120 lines of acceptable duplication for a 6-page site), (b) one tiny `nav.html` + `<iframe>` (poor SEO -- don't), (c) a 50-line Python script `build.py` that injects `nav.html` + `footer.html` into placeholder comments before commit (no runtime, no build step in deployment -- just a pre-commit helper). Option (c) is the senior move once the site grows past 6 pages.

**Comments:** the box-drawing banners (`/* ════ */`) and `<!-- ═══ HERO ═══ -->` aren't user-visible -- ASCII rule (CLAUDE.md) covers rendered content; comments are OK. Comments are sparse and useful (e.g. the 5 TODO markers documenting future Calendly event types). No code-explaining-itself bloat. Good.

**Naming:** CSS classes use kebab-case consistently, with sensible BEM-ish prefixes per component (`.pain-card-num`, `.pain-card-title`, `.pain-card-body`). No name collisions. Some prefixes drift -- `.ref-item-*` vs `.ref-case-*` vs `.ref-meta-*` all share an enclosing `#references` but use three different prefix conventions. Workable.

**Hard-coded URLs:** beyond the Calendly URL (Top 10 #9), the canonical base `https://mantait.cz` is hardcoded in `og:url`, canonical, JSON-LD `@id`, schema URLs -- 30+ occurrences. If the domain ever changes (e.g. you go international and want `mantait.com`), it's a global find-and-replace. Acceptable for a static site; not worth a templating layer just for this.

**Inline styles:** 8 occurrences (see grep results). Worst offenders: `weby.html:202` and `raynet.html:183, 212` set layout properties (`max-width`, `grid-template-columns`, `padding`) inline that should be CSS classes (`.process-steps-narrow`, `.ai-cards-single`). `kontakt.html:87` sets `padding: 56px 0` on the `<section>` -- should be a class (or section already gets `var(--pad-section)` from base styles). `index.html:300, 530` are one-off margin adjustments -- pure smell. `index.html:429, 689` set inline `color:var(--accent)` on `<a>` -- there should be one global `a { color: var(--accent) }` or a `.link-accent` class. All trivial fixes.

## 6. Antipatterns specific to this codebase

Items covered in Top 10 not repeated. The remaining specific issues:

**Nested-card `<a><button>` already in Top 10 #4.** Same antipattern, repeated four times in product cards. The `event.stopPropagation();event.preventDefault();` chain on the inner button (`index.html:570` etc.) is the giveaway -- it's papering over the click conflict the structure itself creates.

**`href="#" onclick="...return false;"`** -- 13 instances, already in Top 10 #6. Worth restating: this is the single clearest "vibe-coded" signature in the codebase. A senior wouldn't write it once, let alone 13 times. Fix is mechanical: change `<a href="#" class="nav-cta" onclick="...">` to `<button class="nav-cta" data-calendly>...</button>` and add three lines of `addEventListener` in a tiny inline script.

**Anchor target without `scroll-margin-top` for `<div id="governance">`.** `style.css:37-42` applies `scroll-margin-top: 84px` to `section[id]`, `[id^="quick"]`, `[id^="assess"]`, `[id^="web-"]` -- but not to plain `<div id="governance">` (`index.html:279`), the anchor target of the in-page link on `index.html:429`. Click that link -> the heading scrolls under the sticky 84px nav. Easiest fix: add `.governance-box[id]` to the selector, or change the markup to `<section class="governance-box" id="governance">`.

**Dead `[id^="quick"]` selector** (`style.css:38`). The web-quick ID has `web-` prefix; nothing matches `quick`. Probably a leftover from a rename. Delete.

**Two unused CSS classes referenced in media queries.** `style.css:1965, 2069` apply font-size to `.ai-teaser` which has no declaration and no markup match. Dead reference inside a live block -- the kind of thing a linter would catch.

**FAQ markup is not progressive disclosure.** `<div class="faq-item">` with always-visible answer (`ai.html:303-336`, `weby.html:247-289`, `raynet.html:294-332`). Functional, but the Schema.org FAQPage JSON-LD already declares Q/A pairs -- the HTML should match the semantic. Use `<details><summary>` for native disclosure + keyboard support, zero JS. Bonus: gets you "FAQ-rich-results" eligibility consistency between the JSON-LD and rendered DOM.

**No `:focus-visible` styling.** `style.css` has exactly one focus selector (`:focus-within` on nav-dropdown, `:211`). Keyboard navigation across the whole site uses the browser default outline only -- which is fine on most pages but invisible against `--accent` background of `.btn` buttons. Add a global `:focus-visible { outline: 2px solid var(--accent-warm); outline-offset: 2px; }`.

**No `prefers-reduced-motion`.** Hover transitions on subservice-row include `transform: translateX(4px)` (`:803`). Honor `@media (prefers-reduced-motion: reduce)` -- 5 lines.

## Co je dobre

Don't touch:

- **Palette + tokens.** Warm-professional `:root` block (`style.css:7-33`) is genuinely thoughtful. Semantic naming.
- **`clamp()` for type and spacing.** `style.css:31, 81-83` -- fluid typography without a JS shim.
- **JSON-LD per page.** Right schema for each page, prices structured properly. This is in the top 10 % of Czech B2B service sites.
- **llms.txt.** Compliant, accurate, current. Most CZ sites don't have one at all.
- **Czech copy.** No anglicisms, no buzzwords, no IT jargon to non-tech buyers. The "Konzultanti doporucuji. Ja prebiram rizeni." brand discipline is consistent across every CTA and pull-quote.
- **TODO comments are tracking real backlog**, not "WIP" noise. Five Calendly event-type swaps documented in-place.
- **No frameworks, no build step.** The stack choice is correct for a 6-page brochure site and is held with discipline -- no React, no Tailwind, no Webpack, no Vite. This is the senior call.
- **Responsive grid using CSS grid, not utility classes.** Component-scoped layout.
- **No analytics / tracking / cookies banner.** Privacy-respectful by absence. Czech B2B clients reading the source notice this.
- **Sticky nav with backdrop-filter blur** (`style.css:127-130`). Modern, performant.
- **Process / pain-card design.** Five-card grid with circled numbers + horizontal connector line via `::before` pseudo-element (`style.css:499-508`) -- elegant, no SVG, no image.

Net: the project's bones say senior. The defects above are the difference between "you can tell" and "you can't." Two evenings of fixes, then submit it for Petr's "senior in the source code" claim with a straight face.
