# -*- coding: utf-8 -*-
"""Sestavi _pristup/portal.js z prototypu Podnikove AI (T0924-477, rez 7 brany).

Portal se servuje jen za osobnim odkazem /p/<token> (worker.js ho bundluje
importem); zdroj pravdy je ../specs/podnikova-ai/prototyp/portal.html.

    python scripts/sestav_portal.py           # zapise _pristup/portal.js
    python scripts/sestav_portal.py --check   # exit 1, kdyz portal.js driftuje

Web checkoutnuty samostatne (bez specs/): --check jen varuje, zapis vrati 1.
"""
import io, json, os, sys

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZDROJ = os.path.join(KOREN, '..', 'specs', 'podnikova-ai', 'prototyp', 'portal.html')
CIL = os.path.join(KOREN, '_pristup', 'portal.js')
HLAVICKA = '// GENEROVANO web/scripts/sestav_portal.py -- needitovat rucne\n'


def ocekavany():
    # newline='' -- konce radku zdroje (CRLF) musi projit beze zmeny, test je porovnava
    html = io.open(ZDROJ, encoding='utf-8', newline='').read()
    return HLAVICKA + 'export default %s;\n' % json.dumps(html, ensure_ascii=False)


def main(argv):
    check = '--check' in argv
    if not os.path.exists(ZDROJ):
        print('[sestav_portal] varovani: chybi %s' % os.path.normpath(ZDROJ))
        return 0 if check else 1
    obsah = ocekavany()
    if check:
        # univerzalni konce radku: git s autocrlf vrati cil s CRLF; literal ma \r\n escapovane
        disk = io.open(CIL, encoding='utf-8').read() if os.path.exists(CIL) else None
        if disk != obsah:
            print('[sestav_portal] drift: spust python web/scripts/sestav_portal.py')
            return 1
        return 0
    os.makedirs(os.path.dirname(CIL), exist_ok=True)
    io.open(CIL, 'w', encoding='utf-8', newline='\n').write(obsah)
    print('[sestav_portal] zapsano %s' % os.path.relpath(CIL, KOREN))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
