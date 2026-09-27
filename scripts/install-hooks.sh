#!/bin/sh
# Instalace git hooks pro Manta IT web.
# Pust jednou po klonu repa:
#   sh scripts/install-hooks.sh

cd "$(dirname "$0")/.." || exit 1

# Ve worktree (dilna) je .git soubor, hooky lezi ve spolecnem gitdiru.
# --git-path hooks na nej ukaze a respektuje i core.hooksPath (T0927-114).
hooks=$(git rev-parse --git-path hooks) || exit 1
mkdir -p "$hooks"
cp scripts/pre-commit "$hooks/pre-commit" || exit 1
chmod +x "$hooks/pre-commit"

echo "Pre-commit hook nainstalovan v $hooks/pre-commit"
echo "Po zmene style.css nebo HTML se ?v=hash auto-updatuje pred commit."
