"""Test prepinace --commit (sekce 9 kontrola_webu.py, T0927-106).

a) cizi nestagovany drift mimo commitovanou mnozinu neblokuje commit vlastnich zmen
b) vlastni drift (v commitovanem souboru) blokuje
c) bez prepinace zustava prisna kontrola (drift kdekoli = nalez)

Spusteni: python -X utf8 web/scripts/test_kontrola_commit.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

WEB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPECS = os.path.join(os.path.dirname(WEB), 'specs', 'web-redesign')
IGNORUJ = shutil.ignore_patterns('.git', 'node_modules', '__pycache__')


def _env():
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    env['PATH'] = os.path.dirname(sys.executable) + os.pathsep + env.get('PATH', '')
    return env


def _git(cwd, *args):
    return subprocess.run(['git'] + list(args), cwd=cwd, capture_output=True, text=True,
                           encoding='utf-8', timeout=300, env=_env())


def _pripav():
    tmp = tempfile.mkdtemp()
    web = os.path.join(tmp, 'web')
    specs = os.path.join(tmp, 'specs', 'web-redesign')
    shutil.copytree(WEB, web, ignore=IGNORUJ)
    shutil.copytree(SPECS, specs, ignore=IGNORUJ)
    _git(web, 'init', '-q')
    _git(web, 'config', 'core.autocrlf', 'false')
    _git(web, 'config', 'user.name', 'test')
    _git(web, 'config', 'user.email', 'test@test')
    hooks = os.path.join(web, '.git', 'hooks')
    os.makedirs(hooks, exist_ok=True)
    shutil.copy(os.path.join(web, 'scripts', 'pre-commit'), os.path.join(hooks, 'pre-commit'))
    os.chmod(os.path.join(hooks, 'pre-commit'), 0o755)
    _git(web, 'add', '-A')
    r = _git(web, 'commit', '-q', '--no-verify', '-m', 'base')
    return tmp, web, r


def _drift(web):
    stranka = os.path.join(web, 'o-mne.html')
    with open(stranka, encoding='utf-8') as f:
        html = f.read()
    with open(stranka, 'w', encoding='utf-8', newline='') as f:
        f.write(html.replace('</body>', '<p>cizi drift</p>\n</body>', 1))
    with open(os.path.join(web, 'sluzba.css'), 'a', encoding='utf-8') as f:
        f.write('\n/* cizi drift */\n')


def krok_a():
    tmp, web, r0 = _pripav()
    try:
        if r0.returncode != 0:
            return False, r0
        _drift(web)
        with open(os.path.join(web, 'test-commit.txt'), 'w', encoding='utf-8', newline='') as f:
            f.write('x\n')
        _git(web, 'add', 'test-commit.txt')
        r = _git(web, 'commit', '-m', 'vlastni', '--', 'test-commit.txt')
        vystup = (r.stdout or '') + (r.stderr or '')
        ok = (r.returncode == 0 and 'drift mimo commit' in vystup
              and 'o-mne.html' in vystup and 'sluzba.css' in vystup)
        if ok:
            show = _git(web, 'show', '--name-only', '--format=', 'HEAD')
            ok = 'test-commit.txt' in show.stdout and 'o-mne.html' not in show.stdout
        if ok:
            status = _git(web, 'status', '--porcelain')
            ok = 'o-mne.html' in status.stdout and 'sluzba.css' in status.stdout
        return ok, r
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def krok_b():
    tmp, web, r0 = _pripav()
    try:
        if r0.returncode != 0:
            return False, r0
        _drift(web)
        pred = _git(web, 'rev-parse', 'HEAD').stdout.strip()
        _git(web, 'add', 'o-mne.html')
        r = _git(web, 'commit', '-m', 'cizi', '--', 'o-mne.html')
        po = _git(web, 'rev-parse', 'HEAD').stdout.strip()
        vystup = (r.stdout or '') + (r.stderr or '')
        ok = (r.returncode != 0 and 'drift proti prototypu' in vystup
              and 'o-mne.html' in vystup and pred == po)
        return ok, r
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def krok_c():
    tmp, web, r0 = _pripav()
    try:
        if r0.returncode != 0:
            return False, r0
        _drift(web)
        r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(web, 'scripts', 'kontrola_webu.py')],
                            cwd=web, capture_output=True, text=True, encoding='utf-8', timeout=300)
        vystup = (r.stdout or '') + (r.stderr or '')
        ok = r.returncode == 1 and 'drift proti prototypu' in vystup and 'o-mne.html' in vystup and 'sluzba.css' in vystup
        return ok, r
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    selhalo = []
    for jmeno, krok in (('a) cizi drift mimo commit neblokuje', krok_a),
                        ('b) vlastni drift blokuje', krok_b),
                        ('c) bez prepinace prisna kontrola', krok_c)):
        ok, r = krok()
        print('%s %s' % ('OK  ' if ok else 'FAIL', jmeno))
        if not ok:
            selhalo.append(jmeno)
            print('    exit %d\n%s\n%s' % (r.returncode, (r.stdout or '')[-1500:], (r.stderr or '')[-1500:]))
    sys.exit(1 if selhalo else 0)
