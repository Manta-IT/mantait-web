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

Nalez = exit 1 = commit se zastavi. Vyjimky, ktere jsou v poradku (cena
dodavatele "bez DPH", "provize z dotace" jako cenova informace, tabulka
ze zakona), jsou ve VYJIMKY -- rozsiruj je jen s duvodem v komentari.
"""
import io, json, os, re, sys

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STRANKY = ['index.html', 'reseni-vedeni-it.html', 'reseni-nova-aplikace.html',
           'reseni-propojeni.html', 'reseni-bezpecnost.html', 'reseni-ai-zamestnanec.html',
           'reseni-mapa-firmy.html', 'reseni-zadani.html', 'reseni-vyber-systemu.html',
           'reseni-robot-na-zadani.html', 'reseni-podnikova-ai.html', 'weby.html',
           'o-mne.html', 'raynet.html', 'dotace-mas.html', 'clanky/index.html']
TYPO = {'em-dash': '—', 'en-dash': '–', 'smart quotes': '[“”„‘’]', 'ellipsis': '…'}
ZAKAZ = [r'\bproviz\w*', r'\bručím\b', r'\bručení\b', r'odpovědnost\w*', r'Kokoška IT', r'Ultramar\w*',
         r'Web Standard', r'Web Quick', r'16 900', r'8 900\b', r'AI linka', r'\bdiscovery\b',
         r'\bscope\b', r'\bstack\b', r'onboarding', r'middleware', r'\bCMS\b', r'\bROI\b',
         r'bez DPH', r'na rozdíl od (agentur|konkurence)',
         # Dotace: hlavni zprava je spoluprace s kancelarami (Petr 10. 9., T0910-61).
         # "podame to za vas" z nas dela konkurenci kancelari, ktere jsou zaroven
         # partnersky kanal i cilova skupina outreach -- a ty web ctou driv nez mail.
         r'(žádost|ji)\s+(vyplníme|zpracujeme)\s+i\s+podáme', r'na plnou moc\s+(ji\s+)?podáme',
         r'podáme ji za vás', r'[Dd]otace na klíč', r'od záměru po podání žádosti']
# (soubor nebo '*', regex na kontext) -> povolene. Duvod v komentari.
VYJIMKY = [
    ('*', r'(licenc|ročně|měsíčně|dodavatel)[^.]{0,60}bez DPH'),   # cena dodavatele, ne nase
    ('*', r'bez DPH[^.]{0,40}(licenc|dodavatel)'),
    ('dotace-mas.html', r'provize z dotace'),                        # cenova informace, povolena vyjimka
    ('reseni-bezpecnost.html', r'prioritou a odpovědností'),         # popis tabulky ze zakona, ne slib
]
CENY = {'reseni-mapa-firmy.html': '39 000', 'reseni-ai-zamestnanec.html': '89 000',
        'weby.html': '35 000', 'dotace-mas.html': '30 000'}
nalezy = []

def text_bez_tagu(html):
    html = re.sub(r'<script.*?</script>', ' ', html, flags=re.S)
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

def povoleno(soubor, kontext):
    return any((f == '*' or f == soubor) and re.search(v, kontext, flags=re.I) for f, v in VYJIMKY)

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
    t = text_bez_tagu(html)
    for z in ZAKAZ:
        for m in re.finditer(z, t, flags=re.I):
            ctx = t[max(0, m.start()-70):m.end()+70].replace('\n', ' ')
            ctx = re.sub(r'\s+', ' ', ctx).strip()
            if not povoleno(s, ctx):
                nalezy.append((s, 'slovo ' + m.group(0), ctx))

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
red = io.open(os.path.join(KOREN, '_redirects'), encoding='utf-8').read()
pravidla = {}
for radek in red.splitlines():
    radek = radek.strip()
    # Komentar je cely radek; '#' uvnitr je fragment (/kontakt -> /#napiste).
    if not radek or radek.startswith('#'):
        continue
    kusy = radek.split()
    if len(kusy) >= 2:
        pravidla[kusy[0]] = kusy[1]

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

for n in nalezy:
    print('  %-28s %-24s %s' % n)
print('[kontrola_webu] %d nalezu, %d stranek' % (len(nalezy), len(STRANKY)))
sys.exit(1 if nalezy else 0)
