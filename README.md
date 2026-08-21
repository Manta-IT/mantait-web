# Manta IT Web

Statický web Manta IT — externí IT leadership pro firmy bez CTO.

**Live:** [https://mantait.cz](https://mantait.cz)

## Stack

Jeden HTML soubor s inline CSS. Žádný build step, žádný framework.

- `index.html` — celý web
- Hosting: Cloudflare Pages (auto-deploy z `master`)
- Fonty: Google Fonts (EB Garamond, Inter)

## Lokální preview

```bash
python -m http.server 8000
# otevřít http://localhost:8000
```

## Edit a release

1. Edituj `index.html`
2. Otevři v prohlížeči, zkontroluj desktop + 800px + 400px šířku
3. Commit + push → Cloudflare Pages automaticky deployne během minuty

Detailní guide: viz `CLAUDE.md`.

## Souvislosti

- **Brand a positioning:** parent workspace (`Manta-IT/manta-it`, private)
- **Lead gen pipeline:** sourozenecké repo, outreach vede na tento web
- **Spec a designové dokumenty:** parent workspace `docs/superpowers/specs/`
