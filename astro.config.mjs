import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://nozil.dev',
  // Astro 6: 'static' is the default; routes opt into server rendering with
  // `export const prerender = false` (used by src/pages/api/contact.ts).
  output: 'static',
  adapter: cloudflare({
    // Optimise images at build time with sharp instead of the runtime
    // Cloudflare Images binding (which requires workerd during prerender).
    imageService: 'compile',
    platformProxy: { enabled: true },
  }),
  integrations: [sitemap()],
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
