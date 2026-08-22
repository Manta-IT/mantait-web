# -*- coding: utf-8 -*-
"""Generuje prehled clanku /clanky/ z clanky/manifest.json (spec WH1).

Pouziti:  python scripts/gen_clanky_index.py
Prepise blok mezi <!-- CLANKY:START --> a <!-- CLANKY:END --> v clanky/index.html
(karty + Blog JSON-LD) a idempotentne doplni chybejici URL clanku do sitemap.xml.
Stdlib only, stejny vzor jako bump-cache.py.
"""
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "clanky", "manifest.json")
INDEX = os.path.join(ROOT, "clanky", "index.html")
SITEMAP = os.path.join(ROOT, "sitemap.xml")

MESICE = ["ledna", "unora", "brezna", "dubna", "kvetna", "cervna", "cervence",
          "srpna", "zari", "rijna", "listopadu", "prosince"]
MESICE_DIA = ["ledna", "února", "března", "dubna", "května",
              "června", "července", "srpna", "září",
              "října", "listopadu", "prosince"]


def datum_cesky(iso):
    y, m, d = iso.split("-")
    return "%d. %s %s" % (int(d), MESICE_DIA[int(m) - 1], y)


def main():
    clanky = json.load(io.open(MANIFEST, encoding="utf-8"))
    clanky.sort(key=lambda c: c["date_published"], reverse=True)

    karty = []
    for c in clanky:
        karty.append(
            '  <div class="ref-case">\n'
            '    <span class="ref-case-tag">%s</span>\n'
            '    <h3><a href="/clanky/%s">%s</a></h3>\n'
            '    <div class="ref-case-body">\n'
            '      <p>%s</p>\n'
            '      <p><a href="/clanky/%s">Číst dál &rarr;</a></p>\n'
            '    </div>\n'
            '  </div>'
            % (datum_cesky(c["date_published"]), c["slug"], c["title"],
               c["description"], c["slug"]))

    blog_ld = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Manta IT - články",
        "url": "https://mantait.cz/clanky/",
        "blogPost": [
            {"@type": "BlogPosting",
             "headline": c["title"],
             "url": "https://mantait.cz/clanky/%s" % c["slug"],
             "datePublished": c["date_published"]}
            for c in clanky
        ],
    }

    blok = ("<!-- CLANKY:START (generovano scripts/gen_clanky_index.py, NEEDITOVAT rucne) -->\n"
            + "\n\n".join(karty)
            + '\n<script type="application/ld+json">\n'
            + json.dumps(blog_ld, ensure_ascii=False, indent=2)
            + "\n</script>\n<!-- CLANKY:END -->")

    s = io.open(INDEX, encoding="utf-8").read()
    start = s.index("<!-- CLANKY:START")
    end = s.index("<!-- CLANKY:END -->") + len("<!-- CLANKY:END -->")
    s = s[:start] + blok + s[end:]
    io.open(INDEX, "w", encoding="utf-8", newline="").write(s)
    print("clanky/index.html: %d clanku" % len(clanky))

    # Homepage highlighty (WH4): blok mezi HIGHLIGHTS:START/END v index.html
    home = os.path.join(ROOT, "index.html")
    h = io.open(home, encoding="utf-8").read()
    if "<!-- HIGHLIGHTS:START" in h:
        hl = [c for c in clanky if c.get("highlight")][:3]
        karty_h = []
        for c in hl:
            karty_h.append(
                '  <a class="init-card" href="/clanky/%s">\n'
                '    <span class="init-badge">%s</span>\n'
                '    <h3>%s</h3>\n'
                '    <p>%s</p>\n'
                '    <span class="init-go">Číst dál &rarr;</span>\n'
                '  </a>' % (c["slug"], datum_cesky(c["date_published"]),
                           c["title"], c["description"]))
        blok_h = ("<!-- HIGHLIGHTS:START (generovano scripts/gen_clanky_index.py) -->\n"
                  + "\n".join(karty_h)
                  + "\n<!-- HIGHLIGHTS:END -->")
        hs = h.index("<!-- HIGHLIGHTS:START")
        he = h.index("<!-- HIGHLIGHTS:END -->") + len("<!-- HIGHLIGHTS:END -->")
        h = h[:hs] + blok_h + h[he:]
        io.open(home, "w", encoding="utf-8", newline="").write(h)
        print("index.html: %d highlightu" % len(hl))

    sm = io.open(SITEMAP, encoding="utf-8").read()
    pridano = 0
    urls = ["https://mantait.cz/clanky/"] + [
        "https://mantait.cz/clanky/%s" % c["slug"] for c in clanky]
    for u in urls:
        if u + "</loc>" not in sm:
            sm = sm.replace("</urlset>", "  <url><loc>%s</loc></url>\n</urlset>" % u)
            pridano += 1
    if pridano:
        io.open(SITEMAP, "w", encoding="utf-8", newline="").write(sm)
    print("sitemap.xml: +%d URL" % pridano)


if __name__ == "__main__":
    sys.exit(main())
