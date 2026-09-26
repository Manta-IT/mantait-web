# -*- coding: utf-8 -*-
"""Strojova kontrola produkcniho webu. Bezi v pre-commit hooku (scripts/pre-commit)
a rucne pred kazdym releasem: `python scripts/kontrola_webu.py`.

Co hlida (jen soubory na disku, zadny server):
 1. kazdy interni odkaz (href/src i 'reseni-...' v datech skriptu) vede na
    existujici soubor v repu
 2. typografie: zadny em-dash, en-dash, smart quotes, ellipsis
 3. zakazana slova v textu ven (manta-copy): provize, rucim, odpovednost,
    zargon, stare nazvy a ceny (Web Standard/Quick, 16 900, 8 900, AI linka)
 4. pevne ceny sluzeb jsou na homepage i na detailu stejne
 5. registr `sluzby.json` sedi se svetem: stranka existuje, je v llms.txt,
    nazev sedi se jmenem sluzby v JSON-LD (META v prenos.py)
 6. presmerovani: `_redirects` a zalozni mapa ve worker.js sedi, cile
    existuji a nevedou na dalsi presmerovani
 7. skripty neblokuji vykresleni: `sluzba.js`/`mobil.js` maji `defer`,
    `odkryj()` bezi jen v `type="module"`
 8. ikony v hlavicce: kazda stranka s `<head` ma cely blok ikon
    (favicon.svg, favicon-32.png, apple-touch-icon, manifest) a assety
    z bloku existuji na disku

Nalez = exit 1 = commit se zastavi. Zakazy a jejich vyjimky (kontext) ziji
v ../_meta/predpisy/, web cte vygenerovanou kopii scripts/predpisy.json.
"""
import io, json, os, re, subprocess, sys, unicodedata

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def presmerovani():
    """_redirects -> [(zdroj, cil, kod)]. kod je '' kdyz radek nema treti sloupec."""
    red = io.open(os.path.join(KOREN, '_redirects'), encoding='utf-8').read()
    vysledek = []
    for radek in red.splitlines():
        radek = radek.strip()
        # Komentar je cely radek; '#' uvnitr je fragment (/kontakt -> /#napiste).
        if not radek or radek.startswith('#'):
            continue
        kusy = radek.split()
        if len(kusy) >= 2:
            vysledek.append((kusy[0], kusy[1], kusy[2] if len(kusy) >= 3 else ''))
    return vysledek

def stranky_ze_sitemap():
    """web/sitemap.xml -> seznam cest relativnich ke KOREN, bez presmerovanych zdroju."""
    text = io.open(os.path.join(KOREN, 'sitemap.xml'), encoding='utf-8').read()
    urls = re.findall(r'<loc>https://mantait\.cz(/[^<]*)</loc>', text)
    zdroje = set(z for z, _, _ in presmerovani() if not z.endswith('*'))
    prefixy = tuple(z.rstrip('*') for z, _, _ in presmerovani() if z.endswith('*'))
    vysledek = []
    for url in urls:
        if url in zdroje or url.startswith(prefixy):
            continue
        if url == '/':
            vysledek.append('index.html')
        elif url.endswith('/'):
            vysledek.append(url[1:] + 'index.html')
        else:
            vysledek.append(url[1:] + '.html')
    return vysledek

STRANKY = stranky_ze_sitemap()
TYPO = {'em-dash': '—', 'en-dash': '–', 'smart quotes': '[“”„‘’]', 'ellipsis': '…'}
# 3. Zakazana slova: jedine misto je ../_meta/predpisy/ (vrstvy akce-web, hlas-manta-it,
# domena-dotace-mas; T0923-104). Web je samostatny repo, cte vygenerovanou kopii
# scripts/predpisy.json (`python -X utf8 scripts/stroj/predpisy.py vygeneruj` v rootu workspace;
# scripts/ je v .assetsignore, takze interni pravidla se na web nenasazuji).
# Kazde pravidlo nese vlastni `kontext` (vyjimku) -- do 24. 9. platila vyjimka "cena
# dodavatele bez DPH" pro VSECHNA slova v okoli a schovala napr. "provize" vedle licence.
PREDPISY = json.load(io.open(os.path.join(KOREN, 'scripts', 'predpisy.json'), encoding='utf-8'))['predpisy']

def srovnej(t):
    """Mala pismena bez diakritiky -- v tomhle tvaru jsou vzory predpisu."""
    t = unicodedata.normalize('NFKD', t.replace('\u00a0', ' ').lower())
    return ''.join(z for z in t if not unicodedata.combining(z))

CENY = {'reseni-mapa-firmy.html': '39 000', 'reseni-ai-zamestnanec.html': '89 000',
        'weby.html': '35 000', 'dotace-mas.html': '30 000'}
# nalezy predpisu v clancich, oprava textu = task Pro: growth (T0926-144, R6a); nic jineho sem nepatri
ZNAME_NALEZY = {('clanky/co-je-raynet-crm-kolik-stoji-a-s-cim-ho-propojit.html', 'Z07')}
nalezy = []
varovani = []

def text_bez_tagu(html):
    # Retezce v inline skriptech jsou taky text ven (karty cyklu na homepage --
    # 19. 9. tam prezilo "Bez provize od dodavatele", protoze skripty se zahazovaly).
    skripty = ' '.join(re.findall(r'<script.*?</script>', html, flags=re.S))
    literaly = ' . '.join(re.findall(r"'([^'\n]{12,})'", skripty))
    html = re.sub(r'<script.*?</script>', ' ', html, flags=re.S) + ' ' + literaly
    html = re.sub(r'<style.*?</style>', ' ', html, flags=re.S)
    return re.sub(r'<[^>]+>', ' ', html)

def soubor_pro(url, odkud):
    """Interni URL -> cesta v repu, nebo None, kdyz se nekontroluje."""
    if url.startswith(('http', 'mailto:', 'tel:', 'data:', '#')) or '${' in url:
        return None
    url = url.split('#')[0].split('?')[0]
    if not url:
        return None
    if url.startswith('/'):
        cesta = url[1:]
    else:
        cesta = os.path.join(os.path.dirname(odkud), url).replace('\\', '/')
    if cesta == '' or cesta.endswith('/'):
        cesta += 'index.html'
    plna = os.path.join(KOREN, cesta)
    if os.path.exists(plna):
        return plna
    if not os.path.splitext(cesta)[1] and os.path.exists(plna + '.html'):
        return plna + '.html'
    return plna  # neexistuje -> nalez

for s in STRANKY:
    cesta = os.path.join(KOREN, s)
    if not os.path.exists(cesta):
        nalezy.append((s, 'CHYBI SOUBOR', '')); continue
    html = io.open(cesta, encoding='utf-8').read()
    cile = set(re.findall(r'(?:href|src)="([^"]+)"', html))
    cile |= set(re.findall(r"'(/(?:reseni|clanky|weby|dotace|raynet|o-mne)[^']*)'", html))
    for u in sorted(cile):
        f = soubor_pro(u, s)
        if f and not os.path.exists(f):
            nalezy.append((s, 'odkaz neexistuje', u))
    for k, v in TYPO.items():
        n = len(re.findall(v, html))
        if n: nalezy.append((s, 'typografie ' + k, str(n)))
    t = re.sub(r'\s+', ' ', srovnej(text_bez_tagu(html)))
    for p in PREDPISY:
        for m in re.finditer(p['vzor'], t):
            ctx = t[max(0, m.start()-80):m.end()+80].strip()
            # vyjimka omlouva jen nalez, ktery sama pokryva (jako predpisy.omluveno)
            if not (p.get('kontext') and any(k.start() <= m.start() and k.end() >= m.end()
                                             for k in re.finditer(p['kontext'], t))):
                if (s, p['id']) in ZNAME_NALEZY:
                    varovani.append((s, '%s %s' % (p['id'], m.group(0)), ctx))
                else:
                    nalezy.append((s, '%s %s' % (p['id'], m.group(0)), ctx))

idx = io.open(os.path.join(KOREN, 'index.html'), encoding='utf-8').read()
for s, c in CENY.items():
    p = os.path.join(KOREN, s)
    if os.path.exists(p) and c not in io.open(p, encoding='utf-8').read():
        nalezy.append((s, 'cena chybi na detailu', c))
    if c not in idx:
        nalezy.append(('index.html', 'cena chybi na homepage', c))

# --- 5. konzistence registru sluzeb -------------------------------------
# Ctyri mista popisuji tutez nabidku a rozchazela se: `sluzby.json` (odkazy
# z clanku), stranka, `llms.txt` (co ctou AI asistenti) a META v prenos.py
# (z nej se sklada JSON-LD Service, tedy nazev pro vyhledavace). 8. 9. se
# lisily tri nazvy -- rozdil nikdo nevidel, protoze ho nikdo nemeril.
#
# Znama a zatim vedoma odchylka: registr nese kratky nazev, JSON-LD dlouhy.
# Sjednoceni je obsahove rozhodnuti (task T0908-69), do te doby vyjimka.
NAZEV_JINAK = {
    'reseni-mapa-firmy':    'Příprava firmy: data, procesy a lidé',
    'reseni-nova-aplikace': 'Aplikace a systémy na míru',
    'reseni-propojeni':     'Propojení systémů a automatizace',
}

registr = json.load(io.open(os.path.join(KOREN, 'sluzby.json'), encoding='utf-8'))
registr.pop('_', None)
llms = io.open(os.path.join(KOREN, 'llms.txt'), encoding='utf-8').read()
meta = io.open(os.path.join(os.path.dirname(KOREN), 'specs', 'web-redesign', 'prenos.py'),
               encoding='utf-8').read()
meta = meta[meta.index('META = {'):meta.index('# JSON-LD pro stranky bez sluzby')] + "\n    '"

for klic, v in registr.items():
    cesta = os.path.join(KOREN, klic + '.html')
    if not os.path.exists(cesta):
        nalezy.append(('sluzby.json', 'stranka neexistuje', klic))
        continue
    html = io.open(cesta, encoding='utf-8').read()
    if 'https://mantait.cz/' + klic not in llms:
        nalezy.append(('llms.txt', 'sluzba chybi', klic))
    ocekavany = NAZEV_JINAK.get(klic, v['nazev'])
    if ocekavany not in html:
        nalezy.append((klic + '.html', 'nazev registru neni na strance', ocekavany))
    b = re.search(r"'%s\.html': dict\((.*?)\),\n    '" % re.escape(klic), meta, re.S)
    ld = re.search(r"sluzba='([^']+)'", b.group(1)) if b else None
    if ld and ld.group(1) != ocekavany:
        nalezy.append(('prenos.py META', 'JSON-LD nazev != registr',
                       '%s != %s' % (ld.group(1), v['nazev'])))

# --- 6. presmerovani: _redirects vs zaloha ve worker.js -----------------
# Co vidi navstevnik, urcuje `_redirects` (zmereno 8. 9. na produkci: assety
# se vyhodnocuji driv nez Worker). Mapa PRESMEROVANI ve worker.js je jen
# zaloha a 8. 9. se od souboru tise lisila ve dvou cilech. Hlidame tri veci:
# oba seznamy sedi, cil existuje, a cil sam neni zdrojem dalsiho pravidla
# (to by byl retez nebo smycka).
pravidla = {z: c for z, c, _ in presmerovani()}

wj = io.open(os.path.join(KOREN, 'worker.js'), encoding='utf-8').read()
mapa = dict(re.findall(r"\['(/[^']*)', '([^']*)'\]", wj))
prefixy = tuple(p.rstrip('*') for p in pravidla if p.endswith('*'))

for zdroj, cil in pravidla.items():
    if zdroj.endswith('*'):
        continue
    if zdroj in mapa and mapa[zdroj] != cil:
        nalezy.append(('worker.js', 'zaloha presmerovani != _redirects',
                       '%s: %s vs %s' % (zdroj, mapa[zdroj], cil)))
    holy = cil.split('#')[0].rstrip('/')
    if holy and holy in pravidla:
        nalezy.append(('_redirects', 'presmerovani vede na presmerovani',
                       '%s -> %s -> %s' % (zdroj, cil, pravidla[holy])))
    if holy and not holy.startswith('http'):
        f = soubor_pro(cil, '_redirects')
        if f and not os.path.exists(f):
            nalezy.append(('_redirects', 'cil neexistuje', '%s -> %s' % (zdroj, cil)))

for zdroj in mapa:
    if zdroj.startswith('/api'):
        continue
    if zdroj not in pravidla and not zdroj.startswith(prefixy):
        nalezy.append(('worker.js', 'presmerovani chybi v _redirects', zdroj))

# --- 7. skripty neblokuji vykresleni ------------------------------------
# sluzba.js a mobil.js bez `defer` drzely LCP nad 2,5 s na 32 z 36 stranek
# (audit CWV 17. 9., T0917-114). S `defer` bezi az po parsovani, takze inline
# skript, ktery vola odkryj() ze sluzba.js, musi byt type="module" (ten se
# odklada taky a bezi az po nem) -- jinak ReferenceError a scena se neodkryje.
for dirpath, _, soubory in os.walk(KOREN):
    if 'node_modules' in dirpath or os.sep + '.' in dirpath:
        continue
    for jmeno in soubory:
        if not jmeno.endswith('.html') or jmeno.startswith('_mobil-test'):  # testovaci harness
            continue
        cesta = os.path.join(dirpath, jmeno)
        s = os.path.relpath(cesta, KOREN).replace('\\', '/')
        html = io.open(cesta, encoding='utf-8').read()
        for tag in re.findall(r'<script[^>]*src="/?(?:sluzba|mobil)\.js[^>]*>', html):
            if ' defer' not in tag:
                nalezy.append((s, 'skript bez defer', tag))
        for tag, telo in re.findall(r'(<script[^>]*>)(.*?)</script>', html, flags=re.S):
            if 'odkryj(' in telo and 'type="module"' not in tag:
                nalezy.append((s, 'odkryj() v klasickem skriptu', tag))

# --- 8. ikony v hlavicce -------------------------------------------------
IKONY_HLAVICKA = (('href="/favicon.svg"', 'favicon.svg'),
                   ('href="/favicon-32.png"', 'favicon-32.png'),
                   ('rel="apple-touch-icon"', 'apple-touch-icon.png'),
                   ('rel="manifest"', 'site.webmanifest'))
for dirpath, _, soubory in os.walk(KOREN):
    if 'node_modules' in dirpath or os.sep + '.' in dirpath:
        continue
    for jmeno in soubory:
        if not jmeno.endswith('.html') or jmeno.startswith('_mobil-test') or jmeno.startswith('brand-lab'):
            continue
        cesta = os.path.join(dirpath, jmeno)
        s = os.path.relpath(cesta, KOREN).replace('\\', '/')
        html = io.open(cesta, encoding='utf-8').read()
        if '<head' not in html:
            continue
        for retezec, co in IKONY_HLAVICKA:
            if retezec not in html:
                nalezy.append((s, 'ikony chybi v hlavicce', co))

for jmeno in ('favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'site.webmanifest'):
    if not os.path.exists(os.path.join(KOREN, jmeno)):
        nalezy.append(('web', 'ikona neexistuje', jmeno))

for v in varovani:
    print('  VAROVANI %-28s %-24s %s' % v)
for n in nalezy:
    print('  %-28s %-24s %s' % n)
print('[kontrola_webu] %d nalezu, %d stranek' % (len(nalezy), len(STRANKY)))
sys.exit(1 if nalezy else 0)
