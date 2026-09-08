# -*- coding: utf-8 -*-
"""Orizne Lighthouse JSON na to, co ma smysl drzet v repu.

Plny report ma pres 800 kB, z toho je vetsina base64 screenshotu -- 28 behu
delalo 23 MB. Orez nechava skore, metriky, nalezy a sit, screenshoty maze.

Pouziti:  python scripts/lighthouse_orez.py docs/lighthouse/2026-09-08-po
"""
import json
import os
import sys

VEN = ('full-page-screenshot', 'screenshot-thumbnails', 'final-screenshot')


def orez(cesta):
    d = json.load(open(cesta, encoding='utf-8'))
    for k in VEN:
        d.get('audits', {}).pop(k, None)
    d.pop('fullPageScreenshot', None)   # 180 kB base64 na soubor
    d.pop('i18n', None)
    d.pop('stackPacks', None)
    d.pop('timing', None)
    for a in d.get('audits', {}).values():
        det = a.get('details')
        if isinstance(det, dict):
            det.pop('debugData', None)
    with open(cesta, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))


def main():
    slozka = sys.argv[1]
    pred = po = 0
    for f in sorted(os.listdir(slozka)):
        if not f.endswith('.json'):
            continue
        c = os.path.join(slozka, f)
        pred += os.path.getsize(c)
        orez(c)
        po += os.path.getsize(c)
    print('%s: %.1f MB -> %.1f MB' % (slozka, pred / 1e6, po / 1e6))


if __name__ == '__main__':
    main()
