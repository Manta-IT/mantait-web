# -*- coding: utf-8 -*-
"""Strojova kontrola produkcniho webu pred nasazenim (8. 9. 2026).

Bezi nad lokalnim serverem (scripts/serve.py, port 8773) a nad soubory:
 1. kazdy interni odkaz (href/src, i v datech skriptu 'reseni-...') odpovi 200
 2. typografie: zadny em-dash, en-dash, smart quotes, ellipsis
 3. zakazana slova v textu ven (manta-copy)
 4. stare nazvy a ceny, ktere uz neplati (Web Standard/Quick, 16 900, 8 900,
    AI linka, Mapa firmy jako nazev sluzby v odkazech)
 5. nesrovnalosti cen mezi strankami (co rika homepage vs. detail)

Spusteni: python scripts/kontrola_webu.py   (server musi bezet)
"""
import io, os, re, sys, glob, urllib.request, urllib.error

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZAKLAD = 'http://localhost:8773'
STRANKY = ['index.html', 'reseni-vedeni-it.html', 'reseni-nova-aplikace.html',
           'reseni-propojeni.html', 'reseni-bezpecnost.html', 'reseni-ai-zamestnanec.html',
           'reseni-mapa-firmy.html', 'reseni-zadani.html', 'reseni-vyber-systemu.html',
           'reseni-robot-na-zadani.html', 'reseni-podnikova-ai.html', 'weby.html',
           'o-mne.html', 'raynet.html', 'dotace-mas.html', 'clanky/index.html']
TYPO = {'em-dash': '—', 'en-dash': '–', 'smart': '[“”„‘’]', 'ellipsis': '…'}
ZAKAZ = [r'\bproviz', r'\bručím\b', r'\bručení\b', r'odpovědnost', r'Kokoška IT', r'Ultramar',
         r'Web Standard', r'Web Quick', r'16 900', r'8 900\b', r'AI linka', r'\bdiscovery\b',
         r'\bscope\b', r'\bstack\b', r'onboarding', r'middleware', r'\bCMS\b', r'\bROI\b',
         r'bez DPH', r'na rozdíl od (agentur|konkurence)']
nalezy = []

def text_bez_tagu(html):
    html = re.sub(r'<script.*?</script>', ' ', html, flags=re.S)
    html = re.sub(r'<style.*?</style>', ' ', html, flags=re.S)
    return re.sub(r'<[^>]+>', ' ', html)

def stav(url):
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'kontrola'}), timeout=10)
        return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        return str(e)[:40]

odkazy = {}
for s in STRANKY:
    cesta = os.path.join(KOREN, s)
    if not os.path.exists(cesta):
        nalezy.append((s, 'CHYBI SOUBOR', '')); continue
    html = io.open(cesta, encoding='utf-8').read()
    # 1. odkazy
    for m in re.finditer(r'(?:href|src)="([^"#?]+)', html):
        odkazy.setdefault(m.group(1), set()).add(s)
    for m in re.finditer(r"'(/(?:reseni|clanky|weby|dotace|raynet|o-mne)[^'#?]*)'", html):
        odkazy.setdefault(m.group(1), set()).add(s)
    # 2. typografie (cely soubor, i skript)
    for k, v in TYPO.items():
        n = len(re.findall(v, html))
        if n: nalezy.append((s, 'typografie ' + k, str(n)))
    # 3+4. zakazana slova jen v textu pro lidi
    t = text_bez_tagu(html)
    for z in ZAKAZ:
        for m in re.finditer(z, t, flags=re.I):
            nalezy.append((s, 'slovo ' + z, t[max(0, m.start()-50):m.end()+50].replace('\n', ' ').strip()))

for u, kde in sorted(odkazy.items()):
    if u.startswith(('http', 'mailto:', 'tel:', 'data:')): continue
    cil = u if u.startswith('/') else '/' + u
    st = stav(ZAKLAD + cil)
    if st != 200:
        nalezy.append((','.join(sorted(kde)), 'odkaz ' + str(st), u))

# 5. ceny: homepage vs detail (hrube, jen pevne castky)
CENY = {'reseni-mapa-firmy.html': '39 000', 'reseni-ai-zamestnanec.html': '89 000',
        'weby.html': '35 000', 'dotace-mas.html': '30 000'}
idx = io.open(os.path.join(KOREN, 'index.html'), encoding='utf-8').read()
for s, c in CENY.items():
    p = os.path.join(KOREN, s)
    if os.path.exists(p) and c not in io.open(p, encoding='utf-8').read():
        nalezy.append((s, 'cena chybi na detailu', c))
    if c not in idx:
        nalezy.append(('index.html', 'cena chybi na homepage', c))

for n in nalezy:
    print('%-32s %-28s %s' % n)
print('\n%d nalezu, %d odkazu overeno' % (len(nalezy), len(odkazy)))
sys.exit(1 if nalezy else 0)
