// Resolves the wrangler config that @astrojs/cloudflare generated and prints
// its path. Used by the preview/deploy scripts and the deploy workflow.
//
// - Mixed build (has server routes, e.g. /api/contact): config + worker live
//   in dist/server/wrangler.json, assets in ../client. Use it directly.
// - Static-only build: the adapter writes the config *inside* the assets dir
//   (dist/client/wrangler.json). `wrangler dev` then watches its own config
//   file and reload-loops forever. Emit a corrected copy one level up
//   (dist/wrangler.json, assets repointed to ./client) so the config sits
//   outside the watched directory.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

if (existsSync('dist/server/wrangler.json')) {
  process.stdout.write('dist/server/wrangler.json')
} else if (existsSync('dist/client/wrangler.json')) {
  const cfg = JSON.parse(readFileSync('dist/client/wrangler.json', 'utf8'))
  cfg.assets = { ...cfg.assets, directory: './client' }
  writeFileSync('dist/wrangler.json', JSON.stringify(cfg))
  process.stdout.write('dist/wrangler.json')
} else {
  process.stderr.write('No generated wrangler.json found in dist/. Run `pnpm build` first.\n')
  process.exit(1)
}
