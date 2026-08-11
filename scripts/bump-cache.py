#!/usr/bin/env python
"""
Cache-bust style.css href ve všech HTML stránkách v rootu webu.

Použití:
    python scripts/bump-cache.py            # použije aktuální git short hash
    python scripts/bump-cache.py manual123  # custom version string

Spustit PŘED git commit. Cloudflare _headers pro style.css je nastaven na
max-age=1 rok + immutable, takže ?v=<hash> je jediný mechanismus jak donutit
browsery stáhnout novou verzi.
"""
import os
import re
import subprocess
import sys

WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
# HTML stranky v rootu + v podadresarich s obsahem (clanky/). Stranky bez
# style.css linku se preskoci. Podadresare pouzivaji root-relativni cestu
# "/style.css", root cestu relativni -- proto dva vzory nize.
SUBDIRS = ['clanky']
PAGES = sorted(f for f in os.listdir(WEB_DIR) if f.endswith('.html'))
PAGES += sorted(
    os.path.join(d, f)
    for d in SUBDIRS if os.path.isdir(os.path.join(WEB_DIR, d))
    for f in os.listdir(os.path.join(WEB_DIR, d)) if f.endswith('.html')
)


def get_version() -> str:
    if len(sys.argv) > 1:
        return sys.argv[1]
    result = subprocess.run(
        ['git', 'log', '-1', '--format=%h'],
        cwd=WEB_DIR, capture_output=True, text=True, check=True,
    )
    return result.stdout.strip()


def bump_file(filepath: str, version: str) -> bool:
    with open(filepath, encoding='utf-8') as f:
        content = f.read()
    pattern = re.compile(r'href="(/?)style\.css(?:\?v=[^"]*)?"')
    new_content, count = pattern.subn(
        lambda m: f'href="{m.group(1)}style.css?v={version}"', content)
    if count == 0:
        return False
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'  {os.path.basename(filepath)}: ?v={version} ({count} ref)')
        return True
    print(f'  {os.path.basename(filepath)}: uz aktualni (?v={version})')
    return False


def main() -> int:
    version = get_version()
    print(f'Cache bump version: {version}')
    changed = 0
    for page in PAGES:
        path = os.path.join(WEB_DIR, page)
        if bump_file(path, version):
            changed += 1
    print(f'Updated: {changed}/{len(PAGES)} files')
    return 0


if __name__ == '__main__':
    sys.exit(main())
