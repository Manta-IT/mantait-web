#!/bin/sh
# Smoke test formularoveho endpointu. Nejdriv v druhem okne:
#   npx wrangler dev --port 8788 --local --compatibility-date 2026-06-02
# (compatibility-date override je jen kvuli starsimu lokalnimu binary wrangleru;
#  v produkci plati datum z wrangler.jsonc)
# Pouziti: sh scripts/smoke-forms.sh
set -e
B=${1:-http://127.0.0.1:8788}
fail=0
check() {
  got=$(eval "$2")
  if [ "$got" = "$3" ]; then echo "OK   $1"; else echo "FAIL $1: cekano '$3', dostal '$got'"; fail=1; fi
}

check "statika se servíruje" \
  "curl -s -o /dev/null -w '%{http_code}' $B/dotace-mas" "200"
check "GET na /api/dotaznik je odmitnut" \
  "curl -s -o /dev/null -w '%{http_code}' $B/api/dotaznik" "405"
check "POST bez e-mailu i telefonu neprojde" \
  "curl -s -o /dev/null -w '%{http_code}' -X POST -d 'ico=123' $B/api/dotaznik" "502"
check "POST s nevalidnim e-mailem neprojde" \
  "curl -s -o /dev/null -w '%{http_code}' -X POST -d 'email=neplatny' $B/api/dotaznik" "502"
check "honeypot tise presmeruje na dekovacku" \
  "curl -s -o /dev/null -w '%{redirect_url}' -X POST -d 'website=bot&email=a@b.cz' $B/api/dotaznik" "$B/dekujeme"
check "chybejici API klic je hlasita chyba, ne tichy propad" \
  "curl -s -X POST -d 'email=t@example.com' $B/api/dotaznik | grep -c 'Odesilani e-mailu neni'" "1"

[ $fail -eq 0 ] && echo "--- vse proslo" || { echo "--- NEPROSLO"; exit 1; }
