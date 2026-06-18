import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'
import { z } from 'zod'
import { Resend } from 'resend'

export const prerender = false

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .min(1)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'A valid email is required'),
  subject: z.string().optional(),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  _honey: z.string().optional(),
})

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export const POST: APIRoute = async ({ request }) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  const result = contactSchema.safeParse(body)
  if (!result.success) {
    const issues: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0]?.toString() ?? '_form'
      ;(issues[field] ??= []).push(issue.message)
    }
    return json({ error: 'Validation failed', issues }, 422)
  }

  const { name, email, subject, message, _honey } = result.data

  // Honeypot: bots fill this hidden field — silently accept without sending
  if (_honey) {
    return json({ success: true }, 200)
  }

  const { RESEND_API_KEY, EMAIL_FROM, EMAIL_TO } = env

  if (!RESEND_API_KEY || !EMAIL_FROM || !EMAIL_TO) {
    return json({ error: 'Server configuration error' }, 500)
  }

  const resend = new Resend(RESEND_API_KEY)
  const { error: sendError } = await resend.emails.send({
    from: `nozil.dev <${EMAIL_FROM}>`,
    to: EMAIL_TO,
    replyTo: email,
    subject: `[nozil.dev] ${subject || 'New message'}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  })

  if (sendError) {
    return json({ error: 'Failed to send email' }, 500)
  }

  return json({ success: true }, 200)
}
