#!/usr/bin/env bash
set -euo pipefail

# The claude-code feature drops a launcher, but the native CLI isn't fully set
# up until `claude install` runs — otherwise it goes missing after a rebuild.
claude install || true

pnpm install
pnpm exec playwright install --with-deps chromium

echo 'Dev container ready — run: pnpm dev'
