#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Prepise `?v=` u lokalnich CSS a JS na otisk OBSAHU toho souboru.

Pouziti:
    python scripts/bump-cache.py            # otisk obsahu (default)
    python scripts/bump-cache.py manual123  # vynucena verze pro vsechny

Proc otisk obsahu a ne git hash: hook bezi PRED commitem, takze `git log -1`
vraci predchozi commit. Kazdy commit tedy prepsal `?v=` na hash toho
minuleho a hned po commitu zustalo v pracovnim stromu 51 zmenenych souboru,
ktere cekaly na priste. Repozitar byl trvale "dirty" a v tom sumu nebylo
poznat skutecnou rozdelanou praci (nalez 8. 9. 2026).

Otisk obsahu se meni prave tehdy, kdyz se meni soubor. Stranka, jejiz styly
se nezmenily, tedy zustane beze zmeny a strom je po commitu cisty.

Cloudflare `_headers` drzi CSS i JS na roce s `immutable`, takze `?v=` je
jediny zpusob, jak prohlizeci rict, ze ma stahnout novou verzi.
"""
import hashlib
import io
import os
import re
import sys

WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
# HTML stranky v rootu + v podadresarich s obsahem. sk/ a en/ tu chybely od
# zavedeni mutaci 22. 8. -- 38 stranek zustavalo viset na stare verzi CSS
# (nalez 24. 8.).
SUBDIRS = ['clanky', 'sk', 'en']
ODKAZ = re.compile(r'(?:href|src)="(/?)([a-z0-9-]+\.(?:css|js))(?:\?v=[^"]*)?"')

PAGES = sorted(f for f in os.listdir(WEB_DIR) if f.endswith('.html'))
PAGES += sorted(
    os.path.join(d, f)
    for d in SUBDIRS if os.path.isdir(os.path.join(WEB_DIR, d))
    for f in os.listdir(os.path.join(WEB_DIR, d)) if f.endswith('.html'))

_otisky = {}


def otisk(jmeno):
    """Prvnich sedm hex znaku sha1 obsahu souboru v korenu webu."""
    if jmeno not in _otisky:
        cesta = os.path.join(WEB_DIR, jmeno)
        if not os.path.exists(cesta):
            # Odkaz na neexistujici soubor resi kontrola_webu.py, tady se jen
            # nesmi spadnout uprostred bumpu.
            _otisky[jmeno] = 'chybi'
        else:
            _otisky[jmeno] = hashlib.sha1(open(cesta, 'rb').read()).hexdigest()[:7]
    return _otisky[jmeno]


def bump_file(filepath, pevna):
    with io.open(filepath, encoding='utf-8') as f:
        content = f.read()
    new_content, count = ODKAZ.subn(
        lambda m: '%s="%s%s?v=%s"' % (
            'href' if m.group(2).endswith('.css') else 'src',
            m.group(1), m.group(2), pevna or otisk(m.group(2))),
        content)
    if count == 0 or content == new_content:
        return False
    with io.open(filepath, 'w', encoding='utf-8', newline='\n') as f:
        f.write(new_content)
    print('  %s: %d ref' % (os.path.basename(filepath), count))
    return True


def main():
    pevna = sys.argv[1] if len(sys.argv) > 1 else None
    print('Cache bump: %s' % (pevna or 'otisk obsahu'))
    changed = sum(bump_file(os.path.join(WEB_DIR, p), pevna) for p in PAGES)
    if not pevna:
        for jmeno, h in sorted(_otisky.items()):
            print('    %-14s %s' % (jmeno, h))
    print('Updated: %d/%d files' % (changed, len(PAGES)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
