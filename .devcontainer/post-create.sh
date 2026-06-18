#!/usr/bin/env bash
set -euo pipefail

# Named volumes mount root-owned on first creation; everything runs as `node`.
sudo chown node:node /home/node/.claude /home/node/.config/gh /home/node/.local/share/rtk

claude mcp add --scope user playwright npx @playwright/mcp@latest
claude mcp add --transport http astro-docs https://mcp.docs.astro.build/mcp   

pnpm install
pnpm exec playwright install --with-deps chromium

echo 'Dev container ready — run: pnpm dev'
