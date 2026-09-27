"""Test brany driftu (sekce 9 kontrola_webu.py, T0926-140).

a) kontrola nad skutecnym stromem: exit 0 a `drift: 0`
b) prenos.py --dry-run: exit 0
c) kopie web/ + specs/web-redesign/ v tempu s umelym driftem v kdo-jsem.html
   a sluzba.css: kontrola exit 1 a oba soubory jako `drift proti prototypu`

Spusteni: python -X utf8 web/scripts/test_kontrola_drift.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

WEB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPECS = os.path.join(os.path.dirname(WEB), 'specs', 'web-redesign')
IGNORUJ = shutil.ignore_patterns('.git', 'node_modules', '__pycache__')


def spust(skript, cwd, *argy):
    return subprocess.run([sys.executable, '-X', 'utf8', skript, *argy], cwd=cwd,
                          capture_output=True, text=True, encoding='utf-8', timeout=300)


def krok_a():
    r = spust(os.path.join(WEB, 'scripts', 'kontrola_webu.py'), WEB)
    return r.returncode == 0 and 'drift: 0' in r.stdout, r


def krok_b():
    r = spust(os.path.join(SPECS, 'prenos.py'), SPECS, '--dry-run')
    return r.returncode == 0, r


def krok_c():
    with tempfile.TemporaryDirectory() as tmp:
        web = os.path.join(tmp, 'web')
        specs = os.path.join(tmp, 'specs', 'web-redesign')
        shutil.copytree(WEB, web, ignore=IGNORUJ)
        shutil.copytree(SPECS, specs, ignore=IGNORUJ)
        proto = os.path.join(specs, 'prototypy')
        stranka = os.path.join(proto, 'kdo-jsem.html')
        with open(stranka, encoding='utf-8') as f:
            html = f.read()
        with open(stranka, 'w', encoding='utf-8', newline='') as f:
            f.write(html.replace('</body>', '<p>umely drift</p>\n</body>', 1))
        with open(os.path.join(proto, 'sluzba.css'), 'a', encoding='utf-8') as f:
            f.write('\n/* umely drift */\n')
        r = spust(os.path.join(web, 'scripts', 'kontrola_webu.py'), web)
        ok = (r.returncode == 1 and 'drift proti prototypu' in r.stdout
              and 'o-mne.html' in r.stdout and 'sluzba.css' in r.stdout)
        return ok, r


if __name__ == '__main__':
    selhalo = []
    for jmeno, krok in (('a) kontrola nad stromem', krok_a),
                        ('b) prenos --dry-run', krok_b),
                        ('c) umely drift -> exit 1', krok_c)):
        ok, r = krok()
        print('%s %s' % ('OK  ' if ok else 'FAIL', jmeno))
        if not ok:
            selhalo.append(jmeno)
            print('    exit %d\n%s\n%s' % (r.returncode, r.stdout[-1500:], r.stderr[-1500:]))
    sys.exit(1 if selhalo else 0)
