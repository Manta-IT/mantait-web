# -*- coding: utf-8 -*-
"""Vyhodnoti mereni LCP po rezu 1 a rozhodne o rezu 3 (T0924-145 / T0924-451).

Skript nemeri: meri `npx lighthouse`, orezava `lighthouse_orez.py`. Tady se jen
z orezanych JSON behu "po" a z tabulky "Pred" v mereni.md spocitaji mediany
a mechanicky vypise radek `rozhodnuti: rez 3 ano|ne` (prah ze success-criteria.md).
Do mereni.md nic nezapisuje -- vystup vklada asistent.

Pouziti:  python -X utf8 web/scripts/lighthouse_rozhodnuti.py <slozka_po> [--mereni <cesta>]
          python -X utf8 web/scripts/lighthouse_rozhodnuti.py --test
"""
import json
import os
import re
import statistics
import sys
import tempfile

# specs/web-slouceni-nebo-odlozeni-blokujiciho-c/success-criteria.md
PRAH_LCP_MS = 100   # V1: zlepseni LCP musi byt ostre vetsi nez 100 ms
MIN_STRANEK = 2     # V1: aspon 2 ze 3 stranek
MIN_BEHU = 3        # V1: median ze 3 behu
PRAH_TBT_MS = 20    # V2: TBT se nesmi zhorsit o vic nez 20 ms (a CLS zustava 0,00)
MERENI = os.path.join('specs', 'web-slouceni-nebo-odlozeni-blokujiciho-c', 'mereni.md')

AUDITY = {
    'lcp': 'largest-contentful-paint',
    'fcp': 'first-contentful-paint',
    'tbt': 'total-blocking-time',
    'cls': 'cumulative-layout-shift',
}
SLOUPCE = {'lcp': 'LCP ms', 'fcp': 'FCP ms', 'tbt': 'TBT ms', 'cls': 'CLS'}
HLAVICKA = '| stranka | LCP ms | FCP ms | TBT ms | CLS | stylopisu v head | datum |'


def stranka(url):
    s = re.sub(r'^https?://[^/]+', '', url.strip())
    s = s.rstrip('/')
    if s.endswith('.html'):
        s = s[:-len('.html')]
    if not s.startswith('/'):
        s = '/' + s
    return s


def mediany_z_behu(slozka):
    behy = {}
    for f in sorted(os.listdir(slozka)):
        if not f.endswith('.json'):
            continue
        with open(os.path.join(slozka, f), encoding='utf-8') as fh:
            d = json.load(fh)
        url = d.get('finalDisplayedUrl') or d.get('finalUrl') or d.get('requestedUrl')
        hodnoty = {k: d['audits'][a]['numericValue'] for k, a in AUDITY.items()}
        behy.setdefault(stranka(url), []).append(hodnoty)
    vysledek = {}
    for s, seznam in behy.items():
        if len(seznam) < MIN_BEHU:
            raise ValueError('malo behu: %s ma %d, potreba %d' % (s, len(seznam), MIN_BEHU))
        m = {k: statistics.median(b[k] for b in seznam) for k in AUDITY}
        m['behu'] = len(seznam)
        vysledek[s] = m
    return vysledek


def _cislo(text, s, sloupec):
    t = text.replace(' ', '').replace(' ', '').replace(',', '.')
    if t in ('', '-'):
        raise ValueError('chybi baseline: %s %s' % (s, sloupec))
    return float(t)


def _bunky(radek):
    return [b.strip() for b in radek.strip().strip('|').split('|')]


def pred_z_mereni(cesta):
    with open(cesta, encoding='utf-8') as fh:
        radky = fh.read().splitlines()
    sekce = None
    for r in radky:
        if r.startswith('## '):
            if sekce is not None:
                break
            if r.startswith('## Pred'):
                sekce = []
        elif sekce is not None:
            sekce.append(r)
    if sekce is None:
        raise ValueError('v %s chybi sekce "## Pred"' % cesta)
    tabulka = [r for r in sekce if r.strip().startswith('|')]
    if not tabulka:
        raise ValueError('sekce "## Pred" nema tabulku')
    hlavicka = _bunky(tabulka[0])
    for sloupec in ['stranka'] + list(SLOUPCE.values()):
        if sloupec not in hlavicka:
            raise ValueError('tabulka "Pred" nema sloupec: %s' % sloupec)
    idx = {k: hlavicka.index(v) for k, v in SLOUPCE.items()}
    i_stranka = hlavicka.index('stranka')
    vysledek = {}
    for r in tabulka[1:]:
        if re.match(r'^\|[\s:|-]+\|?\s*$', r):
            continue
        b = _bunky(r)
        s = stranka(b[i_stranka])
        vysledek[s] = {k: _cislo(b[i], s, SLOUPCE[k]) for k, i in idx.items()}
    return vysledek


def rozhodni(pred, po):
    chybi = [s for s in pred if s not in po]
    if chybi:
        raise ValueError('v behu "po" chybi stranka: %s' % ', '.join(chybi))
    duvody = []
    lepsich = sum(1 for s in pred if pred[s]['lcp'] - po[s]['lcp'] > PRAH_LCP_MS)
    duvody.append('LCP > %d ms lepsi na %d ze %d' % (PRAH_LCP_MS, lepsich, len(pred)))
    v2 = True
    for s in pred:
        if round(po[s]['cls'], 2) != 0:
            v2 = False
            duvody.append('V2: CLS %s %.2f' % (s, po[s]['cls']))
        zhorseni = po[s]['tbt'] - pred[s]['tbt']
        if zhorseni > PRAH_TBT_MS:
            v2 = False
            duvody.append('V2: TBT %s +%d ms' % (s, round(zhorseni)))
    if v2:
        duvody.append('V2 drzi: CLS 0,00 a TBT max +%d ms na vsech strankach' % PRAH_TBT_MS)
    return lepsich >= MIN_STRANEK and v2, duvody


def vystup(pred, po):
    ano, duvody = rozhodni(pred, po)
    radky = ['## Po (produkce, po rezu 1)', '', HLAVICKA, '|---|---|---|---|---|---|---|']
    for s in pred:
        m = po[s]
        radky.append('| %s | %d | %d | %d | %.2f | - | - |' % (
            s, round(m['lcp']), round(m['fcp']), round(m['tbt']), m['cls']))
    radky.append('')
    radky.append('zlepseni LCP: ' + ', '.join(
        '%s %+d ms' % (s, round(po[s]['lcp'] - pred[s]['lcp'])) for s in pred))
    radky.append('')
    radky.append('rozhodnuti: rez 3 %s' % ('ano' if ano else 'ne'))
    radky.extend('- ' + d for d in duvody)
    return '\n'.join(radky), ano


def main():
    args = sys.argv[1:]
    if args == ['--test']:
        test()
        return
    mereni = MERENI
    if '--mereni' in args:
        i = args.index('--mereni')
        mereni = args[i + 1]
        del args[i:i + 2]
    if len(args) != 1:
        sys.exit(__doc__)
    try:
        text, _ = vystup(pred_z_mereni(mereni), mediany_z_behu(args[0]))
    except ValueError as e:
        print('[lighthouse_rozhodnuti] CHYBA: %s' % e, file=sys.stderr)
        sys.exit(2)
    print(text)


STRANKY_TEST = ['/clanky/ai-zamestnanec-co-je-a-co-neni', '/reseni-bezpecnost', '/kalkulacka']


def _mereni_test(koren, hodnoty):
    cesta = os.path.join(koren, 'mereni.md')
    radky = ['# Mereni', '', '## Pred (produkce, pred rezem 1)', '', HLAVICKA,
             '|---|---|---|---|---|---|---|']
    for s, (lcp, tbt) in zip(STRANKY_TEST, hodnoty):
        radky.append('| %s | %s | 1 200 | %s | 0,00 | 3 | 2026-09-25 |' % (s, lcp, tbt))
    radky += ['', '## Dalsi', '| x | y |']
    with open(cesta, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(radky) + '\n')
    return cesta


def _behy_test(koren, jmeno, behy):
    """behy: {stranka: [(lcp, tbt), ...]}"""
    slozka = os.path.join(koren, jmeno)
    os.mkdir(slozka)
    for s, seznam in behy.items():
        for n, (lcp, tbt) in enumerate(seznam):
            d = {'requestedUrl': 'https://mantait.cz' + s, 'audits': {
                'largest-contentful-paint': {'numericValue': lcp},
                'first-contentful-paint': {'numericValue': 1000.0},
                'total-blocking-time': {'numericValue': tbt},
                'cumulative-layout-shift': {'numericValue': 0.001},
            }}
            with open(os.path.join(slozka, '%s-%d.json' % (s.strip('/').replace('/', '_'), n)),
                      'w', encoding='utf-8') as fh:
                json.dump(d, fh)
    return slozka


def _ocekavej_chybu(fn, text):
    try:
        fn()
    except ValueError as e:
        assert text in str(e), e
        return
    raise AssertionError('cekal jsem ValueError s "%s"' % text)


def test():
    with tempfile.TemporaryDirectory() as koren:
        pred = pred_z_mereni(_mereni_test(koren, [('3 000', 50), ('2500', 50), ('4000,0', 50)]))
        assert pred['/kalkulacka'] == {'lcp': 4000, 'fcp': 1200, 'tbt': 50, 'cls': 0}, pred

        def po(jmeno, lcp, tbt=(50, 50, 50)):
            return mediany_z_behu(_behy_test(koren, jmeno, {
                s: [(l, t)] * 3 for s, l, t in zip(STRANKY_TEST, lcp, tbt)}))

        # a) 2 ze 3 lepsi o 150 ms, CLS 0, TBT beze zmeny -> ano
        ano, _ = rozhodni(pred, po('a', (2850, 2350, 4000)))
        assert ano
        text, ano = vystup(pred, po('a2', (2850, 2350, 4000)))
        assert ano and text.count('rozhodnuti: rez 3 ') == 1, text
        assert 'rozhodnuti: rez 3 ano' in text and '/reseni-bezpecnost -150 ms' in text, text
        # b) jen 1 stranka lepsi -> ne
        ano, duvody = rozhodni(pred, po('b', (2850, 2500, 4000)))
        assert not ano and 'na 1 ze 3' in duvody[0], duvody
        # c) presne 100 ms se nepocita -> ne
        ano, _ = rozhodni(pred, po('c', (2900, 2400, 4000)))
        assert not ano
        # d) median, ne prumer
        m = mediany_z_behu(_behy_test(koren, 'd', {'/kalkulacka': [(1000, 0), (1000, 0), (5000, 0)]}))
        assert m['/kalkulacka']['lcp'] == 1000 and m['/kalkulacka']['behu'] == 3, m
        # e) jen 2 behy -> ValueError
        slozka = _behy_test(koren, 'e', {'/kalkulacka': [(1000, 0), (1000, 0)]})
        _ocekavej_chybu(lambda: mediany_z_behu(slozka), '/kalkulacka')
        # f) LCP lepsi vsude, TBT +30 ms na jedne -> ne
        ano, duvody = rozhodni(pred, po('f', (2500, 2000, 3500), (50, 80, 50)))
        assert not ano and any('TBT' in d for d in duvody), duvody
        # g) '-' v tabulce Pred -> chybi baseline
        cesta = _mereni_test(koren, [('3000', 50), ('-', 50), ('4000', 50)])
        _ocekavej_chybu(lambda: pred_z_mereni(cesta), 'chybi baseline')
        # sloupec pojmenovany jinak -> ValueError s nazvem sloupce, ne tiche 0
        with open(cesta, encoding='utf-8') as fh:
            obsah = fh.read()
        with open(cesta, 'w', encoding='utf-8') as fh:
            fh.write(obsah.replace('| TBT ms |', '| TBT |'))
        _ocekavej_chybu(lambda: pred_z_mereni(cesta), 'TBT ms')
    # h) normalizace URL
    for url in ('https://mantait.cz/kalkulacka', 'https://mantait.cz/kalkulacka.html',
                'http://localhost:8791/kalkulacka/', '/kalkulacka'):
        assert stranka(url) == '/kalkulacka', (url, stranka(url))
    assert stranka('https://mantait.cz/') == '/'
    print('[lighthouse_rozhodnuti] test OK')


if __name__ == '__main__':
    main()
