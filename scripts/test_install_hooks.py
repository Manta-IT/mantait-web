"""Test instalace hooku pres install-hooks.sh (T0927-114).

a) instalace z worktree jde do sdileneho gitdiru
b) instalace v hlavnim repu dal funguje
c) zivy hook webu je aktualni (obsahuje --commit) a shoduje se se scripts/pre-commit

Spusteni: python -X utf8 web/scripts/test_install_hooks.py
"""
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]


def _env():
    return {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}


def _git(cwd, *args):
    return subprocess.run(['git', *args], cwd=cwd, capture_output=True, text=True,
                           encoding='utf-8', timeout=120, env=_env())


def _najdi_sh():
    sh = shutil.which('sh')
    if sh:
        return sh
    git = shutil.which('git')
    if git:
        git_dir = Path(git).resolve().parent
        for kandidat in (git_dir.parent / 'bin' / 'sh.exe', git_dir.parent / 'usr' / 'bin' / 'sh.exe'):
            if kandidat.exists():
                return str(kandidat)
    return None


def _bez_cr(cesta):
    return Path(cesta).read_bytes().replace(b'\r\n', b'\n')


def krok_a_b(sh):
    with tempfile.TemporaryDirectory() as tmp:
        repo = Path(tmp) / 'repo'
        repo.mkdir()
        _git(repo, 'init', '-q')
        _git(repo, 'config', 'core.autocrlf', 'false')
        _git(repo, 'config', 'user.name', 'test')
        _git(repo, 'config', 'user.email', 'test@test')
        scripts = repo / 'scripts'
        scripts.mkdir()
        shutil.copy(WEB / 'scripts' / 'install-hooks.sh', scripts / 'install-hooks.sh')
        shutil.copy(WEB / 'scripts' / 'pre-commit', scripts / 'pre-commit')
        _git(repo, 'add', '-A')
        r = _git(repo, 'commit', '-q', '--no-verify', '-m', 'base')
        if r.returncode != 0:
            return False, 'a) commit base selhal: %s' % r.stderr

        wt = Path(tmp) / 'wt'
        r = _git(repo, 'worktree', 'add', '-q', str(wt), '-b', 'wt')
        if r.returncode != 0:
            return False, 'a) worktree add selhal: %s' % r.stderr

        ocekavany = _bez_cr(WEB / 'scripts' / 'pre-commit')

        r = subprocess.run([sh, str(wt / 'scripts' / 'install-hooks.sh')], cwd=wt,
                            capture_output=True, text=True, encoding='utf-8', timeout=120,
                            env=_env())
        hook = repo / '.git' / 'hooks' / 'pre-commit'
        if r.returncode != 0 or not hook.exists() or _bez_cr(hook) != ocekavany:
            return False, 'a) instalace z worktree selhala: exit=%s stdout=%s stderr=%s' % (
                r.returncode, r.stdout, r.stderr)

        hook.unlink()
        r = subprocess.run([sh, str(repo / 'scripts' / 'install-hooks.sh')], cwd=repo,
                            capture_output=True, text=True, encoding='utf-8', timeout=120,
                            env=_env())
        if r.returncode != 0 or not hook.exists() or _bez_cr(hook) != ocekavany:
            return False, 'b) instalace v hlavnim repu selhala: exit=%s stdout=%s stderr=%s' % (
                r.returncode, r.stdout, r.stderr)
        return True, ''


def krok_c():
    r = _git(WEB, 'rev-parse', '--path-format=absolute', '--git-path', 'hooks/pre-commit')
    if r.returncode != 0:
        r = _git(WEB, 'rev-parse', '--git-path', 'hooks/pre-commit')
        if r.returncode != 0:
            return False, 'c) rev-parse selhalo: %s' % r.stderr
        cesta = (WEB / r.stdout.strip()).resolve()
    else:
        cesta = Path(r.stdout.strip())

    if not cesta.exists():
        return False, 'c) zivy hook %s neexistuje -- spust sh web/scripts/install-hooks.sh' % cesta
    obsah = cesta.read_text(encoding='utf-8')
    if 'python scripts/kontrola_webu.py --commit' not in obsah:
        return False, 'c) zivy hook %s neobsahuje --commit -- spust sh web/scripts/install-hooks.sh' % cesta
    if _bez_cr(cesta) != _bez_cr(WEB / 'scripts' / 'pre-commit'):
        return False, 'c) zivy hook %s se nerovna scripts/pre-commit -- spust sh web/scripts/install-hooks.sh' % cesta
    return True, ''


if __name__ == '__main__':
    sh = _najdi_sh()
    selhalo = []
    if sh is None:
        print('FAIL a)/b) instalace -- sh nenalezen')
        selhalo.append('sh')
    else:
        ok, msg = krok_a_b(sh)
        print('%s a)/b) instalace z worktree i hlavniho repu' % ('OK  ' if ok else 'FAIL'))
        if not ok:
            print('    %s' % msg)
            selhalo.append('ab')

    ok, msg = krok_c()
    print('%s c) zivy hook je aktualni' % ('OK  ' if ok else 'FAIL'))
    if not ok:
        print('    %s' % msg)
        selhalo.append('c')

    sys.exit(1 if selhalo else 0)
