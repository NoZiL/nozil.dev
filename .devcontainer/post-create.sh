#!/usr/bin/env bash
set -euo pipefail

# Named volumes (and their Docker-created parent dirs) mount root-owned; fix all before creating as node.
sudo chown -R node:node /home/node/.claude /home/node/.config /home/node/.local /commandhistory
mkdir -p "$HOME/.local/state" "$HOME/.local/bin"

# Persist zsh history on the nozil.dev-zsh-history volume (survives rebuilds).
cat >> "$HOME/.zshrc" <<'ZRC'
export HISTFILE=/commandhistory/.zsh_history
export HISTSIZE=10000
export SAVEHIST=10000
setopt share_history inc_append_history
ZRC

# Install RTK
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
rtk telemetry disable
rtk init -g --auto-patch

# MCPs — guard against re-running on an existing volume
claude mcp get playwright   2>/dev/null || claude mcp add --scope user playwright npx @playwright/mcp@latest
claude mcp get astro-docs   2>/dev/null || claude mcp add --scope user --transport http astro-docs https://mcp.docs.astro.build/mcp
claude mcp get context7     2>/dev/null || claude mcp add --scope user context7 npx -y @upstash/context7-mcp@latest
if [ ! -f "$HOME/.config/context7/credentials.json" ]; then
  echo "⚠  Context7 not authenticated. Run: npx ctx7 login"
fi

pnpm install

pnpm exec playwright install --with-deps chromium

echo 'Dev container ready — run: pnpm dev'
