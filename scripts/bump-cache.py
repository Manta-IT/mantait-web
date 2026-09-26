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
import subprocess
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


def otisk_obsahu(data):
    """Prvnich sedm hex znaku sha1 obsahu s konci radku normalizovanymi na LF."""
    return hashlib.sha1(data.replace(b'\r\n', b'\n')).hexdigest()[:7]


def otisk(jmeno):
    """Prvnich sedm hex znaku sha1 obsahu souboru v korenu webu.

    Konce radku se normalizuji: CRLF kopie ve worktree dilny prepisovala ?v= na vsech
    strankach, i kdyz se CSS/JS nezmenilo (T0926-160)."""
    if jmeno not in _otisky:
        cesta = os.path.join(WEB_DIR, jmeno)
        if not os.path.exists(cesta):
            # Odkaz na neexistujici soubor resi kontrola_webu.py, tady se jen
            # nesmi spadnout uprostred bumpu.
            _otisky[jmeno] = 'chybi'
        else:
            with open(cesta, 'rb') as f:
                _otisky[jmeno] = otisk_obsahu(f.read())
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


_VERZE = re.compile(r'\?v=[^"]*')


def jen_bump_obsah(index, prac):
    """True, kdyz se texty lisi JEN hodnotami ?v= -- odvozeny bump, zadna cizi prace."""
    index, prac = index.replace('\r\n', '\n'), prac.replace('\r\n', '\n')
    return index != prac and _VERZE.sub('', index) == _VERZE.sub('', prac)


def jen_bumpy():
    """Zmenene HTML, ktere se od indexu lisi jen ?v=. Hook je pridava do commitu vzdy:
    24. 9. restage jen uz stagovanych stranek nechaval ostatni necommitnute (blokovaly
    nasazeni-produkce) a v worktree dilny se ztratily (62 stranek odkazovalo na stare CSS/JS)."""
    zmenene = subprocess.run(['git', 'diff', '--name-only', '--', '*.html'], cwd=WEB_DIR,
                             capture_output=True, text=True, encoding='utf-8').stdout.split()
    ven = []
    for rel in zmenene:
        r = subprocess.run(['git', 'show', ':' + rel], cwd=WEB_DIR, capture_output=True)
        if r.returncode:
            continue
        with io.open(os.path.join(WEB_DIR, rel), encoding='utf-8') as f:
            if jen_bump_obsah(r.stdout.decode('utf-8'), f.read()):
                ven.append(rel)
    return ven


def _test():
    a = '<link href="/a.css?v=111">\n<p>text</p>\n'
    assert jen_bump_obsah(a, a.replace('111', '222'))
    assert jen_bump_obsah(a, a.replace('111', '222').replace('\n', '\r\n')), 'CRLF neni zmena'
    assert not jen_bump_obsah(a, a), 'beze zmeny neni bump'
    assert not jen_bump_obsah(a, a.replace('text', 'jiny')), 'obsah = cizi prace'
    assert not jen_bump_obsah(a, a.replace('111', '222').replace('text', 'jiny')), 'bump + obsah = cizi prace'
    assert otisk_obsahu(b'a\r\nb\r\n') == otisk_obsahu(b'a\nb\n'), 'CRLF a LF = stejny otisk'
    assert otisk_obsahu(b'v2\n') == hashlib.sha1(b'v2\n').hexdigest()[:7], 'LF otisk beze zmeny'
    assert otisk_obsahu(b'a\n') != otisk_obsahu(b'b\n')
    print('bump-cache OK')


def main():
    if '--test' in sys.argv:
        _test()
        return 0
    if '--jen-bumpy' in sys.argv:
        print('\n'.join(jen_bumpy()))
        return 0
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
