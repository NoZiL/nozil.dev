#!/usr/bin/env bash
set -euo pipefail

# Named volumes mount root-owned on first creation; everything runs as `node`.
sudo mkdir -p /home/node/.local/state
sudo chown node:node /home/node/.claude /home/node/.config/gh /home/node/.local/share/rtk /home/node/.local/state

# Install RTK
mkdir -p "$HOME/.local/bin"
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
rtk init -g

# MCPs
claude mcp add --scope user playwright npx @playwright/mcp@latest
claude mcp add --scope user --transport http astro-docs https://mcp.docs.astro.build/mcp
npx --yes ctx7 setup --claude --yes

pnpm install

pnpm exec playwright install --with-deps chromium

echo 'Dev container ready — run: pnpm dev'
