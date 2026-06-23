// Resolves the wrangler config that @astrojs/cloudflare generated and prints
// its path. Used by the preview/deploy scripts and the deploy workflows.
//
// - Mixed build (has server routes, e.g. /api/contact): config + worker live
//   in dist/server/wrangler.json, assets in ../client. Use it directly.
// - Static-only build: the adapter writes the config *inside* the assets dir
//   (dist/client/wrangler.json). `wrangler dev` then watches its own config
//   file and reload-loops forever. Emit a corrected copy one level up
//   (dist/wrangler.json, assets repointed to ./client) so the config sits
//   outside the watched directory.
//
// `--preview` emits a sibling *.preview.json for the fixed staging Worker
// (deploy-preview job in deploy.yml): renamed to `nozil-dev-preview`, with the production
// apex route stripped (it would 409-conflict with prod) and workers_dev
// re-enabled so it gets a stable *.workers.dev URL.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const preview = process.argv.includes('--preview')

function resolveBase() {
  if (existsSync('dist/server/wrangler.json')) {
    return 'dist/server/wrangler.json'
  }
  if (existsSync('dist/client/wrangler.json')) {
    const cfg = JSON.parse(readFileSync('dist/client/wrangler.json', 'utf8'))
    cfg.assets = { ...cfg.assets, directory: './client' }
    writeFileSync('dist/wrangler.json', JSON.stringify(cfg))
    return 'dist/wrangler.json'
  }
  return null
}

const base = resolveBase()
if (!base) {
  process.stderr.write('No generated wrangler.json found in dist/. Run `pnpm build` first.\n')
  process.exit(1)
}

if (!preview) {
  process.stdout.write(base)
} else {
  // Standalone fixed preview Worker — sibling file so the relative assets
  // directory ("../client" or "./client") resolves the same as the base.
  const cfg = JSON.parse(readFileSync(base, 'utf8'))
  cfg.name = 'nozil-dev-preview'
  delete cfg.routes
  cfg.workers_dev = true
  cfg.preview_urls = false
  const out = base.replace(/wrangler\.json$/, 'wrangler.preview.json')
  writeFileSync(out, JSON.stringify(cfg))
  process.stdout.write(out)
}
