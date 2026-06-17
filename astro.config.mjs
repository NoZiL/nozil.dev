import { defineConfig, sessionDrivers } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import pdf from 'astro-pdf'

// https://astro.build/config
export default defineConfig({
  site: 'https://nozil.dev',
  // Bind the dev server to IPv4. Otherwise it listens on [::1] only, which
  // WSL2 → Windows port forwarding (IPv4) can't reach, so the browser hangs.
  server: { host: '127.0.0.1' },
  // Astro 6: 'static' is the default; routes opt into server rendering with
  // `export const prerender = false` (used by src/pages/api/contact.ts).
  output: 'static',
  // The site doesn't use sessions. Without an explicit driver the Cloudflare
  // adapter auto-enables KV-backed sessions and emits an id-less SESSION
  // binding, which `wrangler versions upload` tries to re-provision on every
  // CI run (and fails once the namespace exists).
  session: { driver: sessionDrivers.null() },
  adapter: cloudflare({
    // Optimise images at build time with sharp instead of the runtime
    // Cloudflare Images binding (which requires workerd during prerender).
    imageService: 'compile',
    // platformProxy spins up miniflare/workerd at `astro dev` startup, which
    // hangs here (workerd binds IPv4; localhost may resolve to ::1). The site
    // is static in dev — re-enable per the contact PR when bindings are needed
    // locally (or use `wrangler dev` for that).
    platformProxy: { enabled: false },
  }),
  integrations: [
    sitemap(),
    // Build-time CV: snapshot the /work page to dist/cv.pdf with headless
    // Chromium, so the page and the downloadable CV never drift. Bind the
    // internal preview server to IPv4 for the same WSL2/devcontainer reason as
    // the dev server above (localhost may resolve to ::1 only).
    pdf({
      // The devcontainer/CI Chromium can't use a sandbox (no unprivileged user
      // namespaces); --no-sandbox is the standard headless-Chromium workaround.
      launch: { args: ['--no-sandbox'] },
      baseOptions: {
        path: 'cv.pdf',
        waitUntil: 'networkidle0',
        pdf: {
          format: 'A4',
          printBackground: true,
          margin: { top: '1.5cm', bottom: '1.5cm', left: '1.5cm', right: '1.5cm' },
        },
      },
      pages: { '/work': true },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
