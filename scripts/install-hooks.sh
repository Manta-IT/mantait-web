#!/bin/sh
# Instalace git hooks pro Manta IT web.
# Pust jednou po klonu repa:
#   sh scripts/install-hooks.sh

cd "$(dirname "$0")/.." || exit 1

cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "Pre-commit hook nainstalovan v .git/hooks/pre-commit"
echo "Po zmene style.css nebo HTML se ?v=hash auto-updatuje pred commit."
