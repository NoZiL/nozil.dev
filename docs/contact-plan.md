# Contact Feature Plan

## Goal

A working contact form that delivers submissions directly to Nicolas's inbox via email.
No storage layer — Resend handles delivery, the email thread is the record.

## Architecture

```
Browser form (POST /api/contact)
  → CF Pages Function (src/pages/api/contact.ts)
      → server-side validation (zod)
      → honeypot check
      → send email via Resend SDK:
          from:    EMAIL_FROM env var (contact@nozil.dev)
          to:      EMAIL_TO env var (set in CF Pages dashboard)
          replyTo: <email from form>
          subject: [nozil.dev] <subject from form>
      → return { success: true } or error JSON
Browser
  → Astro island (vanilla JS) handles response + UX states
```

## Email Delivery — Resend

**Why Resend over Mailchannels**: Mailchannels removed free access for CF Pages Functions in 2024.
Resend: free tier (3,000 emails/mo, 100/day), simple SDK, excellent deliverability.

```bash
pnpm add resend
```

```ts
// src/pages/api/contact.ts (CF Pages Function)
import { Resend } from 'resend'

const resend = new Resend(context.env.RESEND_API_KEY)

await resend.emails.send({
  from: `nozil.dev <${context.env.EMAIL_FROM}>`,
  to: context.env.EMAIL_TO,
  replyTo: formEmail,
  subject: `[nozil.dev] ${subject}`,
  text: `Name: ${name}\nEmail: ${formEmail}\n\n${message}`,
})
```

`replyTo` set to the form submitter's email — hitting Reply in Gmail goes straight back to them.

`RESEND_API_KEY` is set in the CF Pages dashboard → Settings → Environment Variables. Never committed.

Sending domain `nozil.dev` must be verified in Resend dashboard (SPF/DKIM records in CF DNS).

## Email Address on the Site — Obfuscation

**`mailto:` links are the easiest spam vector** — any scraper that finds `<a href="mailto:...">` harvests it instantly.

**Plain text** (e.g. the address as raw text in the DOM) is _better_ but not safe either —
scrapers do regex matching on page source and will still find it.

**JS reveal** is the right approach: the email string is never present in the HTML source.
It's assembled and injected by JS only on user click. No scraper parsing static HTML will find it.

Implementation spec:

```html
<!-- No email in source HTML -->
<button type="button" id="reveal-email">Show email address</button>
<span id="email-display" aria-live="polite"></span>
```

```js
document.getElementById('reveal-email').addEventListener('click', () => {
  const addr = ['hello', 'nozil.dev'].join('@')
  const el = document.getElementById('email-display')
  el.textContent = addr
  document.getElementById('reveal-email').hidden = true
})
```

The parts array keeps the address out of plain-text search even in minified JS bundles.
The contact form is the primary channel; this is the last-resort fallback.

## Form Fields

- **Name** (required)
- **Email** (required, validated format)
- **Subject** — optional dropdown: Freelance inquiry · Just saying hi · Other
- **Message** (required, min 20 chars)
- **Honeypot** — hidden `<input tabindex="-1" aria-hidden="true">` bots fill; server drops silently

## Validation

- Client: HTML5 `required` + `type="email"`, progressive enhancement
- Server: Zod schema validation, honeypot check

Rate limiting: handled at the Cloudflare WAF level (dashboard rule: max 5 requests / IP / minute
to `/api/contact`) — no code needed, no storage required.

## UX States

1. Default — empty form, submit button enabled
2. Submitting — button disabled + "Sending…" label
3. Success — form hidden, message: "Thanks! I'll reply within 2 business days."
4. Error (validation) — inline error per field
5. Error (server) — "Something went wrong." + reveal button shown as fallback

## Spam Protection

- Honeypot field (filled → silently return success, drop submission)
- CF WAF rate limiting rule (no code, set in CF dashboard)

## Privacy

- No submission storage — email thread is the only record
- No third-party analytics on the form
- Privacy note inline: "Your message goes directly to Nicolas. Never shared."
