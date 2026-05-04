#!/usr/bin/env bash
# Netlify: dacă acest script iese cu 0, build-ul este anulat (nu se consumă minute).
# Ieșire 1 = continuă build-ul.
#
# Reguli:
# 1) Env ALWAYS_NETLIFY_BUILD=1 în Netlify → Site settings → Environment variables
#    forțează mereu build (ex. primul deploy sau urgență).
# 2) Altfel, build doar dacă ultimul commit conține literal [deploy-netlify] în mesaj.
#
# Deploy manual: Netlify → Deploys → „Trigger deploy” → „Deploy site”
# (nu folosește acest hook de ignore).

set -euo pipefail

if [[ "${ALWAYS_NETLIFY_BUILD:-}" == "1" ]]; then
  exit 1
fi

if git log -1 --pretty=%B 2>/dev/null | grep -qiF '[deploy-netlify]'; then
  exit 1
fi

exit 0
