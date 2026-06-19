/// <reference path="../.astro/types.d.ts" />

// Cloudflare Workers environment bindings — mirrors wrangler.toml [vars] / secrets.
// The global Env type is consumed by cloudflare:workers and the CF adapter handler.
interface Env {
  RESEND_API_KEY?: string
  EMAIL_FROM?: string
  EMAIL_TO?: string
}

// Typed access to CF Workers bindings via: import { env } from 'cloudflare:workers'
declare module 'cloudflare:workers' {
  const env: Env
  export { env }
}
