// Submit the sitemap to Google Search Console after a production deploy.
//
// Google isn't an IndexNow participant and the old google.com/ping endpoint was
// removed in 2023, so its only push is the Search Console API's sitemaps.submit
// (PUT /webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}). Re-submitting nudges
// Google to recrawl using the build-time <lastmod> stamps — see
// docs/discoverability.md.
//
// Auth: mint an access token directly from the service-account key with the
// self-signed JWT-bearer flow (RFC 7523). This is deliberately NOT
// google-github-actions/auth's access_token path — that one impersonates the SA
// via the IAM Credentials API and needs roles/iam.serviceAccountTokenCreator on
// the SA, which a plain key lacks (403 iam.serviceAccounts.getAccessToken). The
// JWT-bearer flow uses the key as its own identity: no impersonation, no extra
// IAM role. The SA still needs Owner on the property for the submit itself.
//
// Reads GSC_SA_KEY (the SA key JSON) from the environment; no-ops if unset so
// the deploy stays green before the secret is configured.
import { createSign } from 'node:crypto'

const raw = process.env.GSC_SA_KEY
if (!raw) {
  console.log('GSC_SA_KEY unset — skipping Google Search Console submit.')
  process.exit(0)
}

const SITE = 'sc-domain:nozil.dev'
const SITEMAP = 'https://nozil.dev/sitemap-index.xml'
const SCOPE = 'https://www.googleapis.com/auth/webmasters'
const TOKEN_URI = 'https://oauth2.googleapis.com/token'

const key = JSON.parse(raw)

const b64url = (input) =>
  Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

// Build and sign the JWT assertion (RS256) with the SA private key.
const now = Math.floor(Date.now() / 1000)
const aud = key.token_uri ?? TOKEN_URI
const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
const claims = b64url(JSON.stringify({ iss: key.client_email, scope: SCOPE, aud, iat: now, exp: now + 3600 }))
const signingInput = `${header}.${claims}`
const signer = createSign('RSA-SHA256')
signer.update(signingInput)
signer.end()
const assertion = `${signingInput}.${b64url(signer.sign(key.private_key))}`

// Exchange the assertion for an access token.
const tokenRes = await fetch(aud, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  }),
})
if (!tokenRes.ok) {
  throw new Error(`Token exchange failed (${tokenRes.status}): ${await tokenRes.text()}`)
}
const { access_token: accessToken } = await tokenRes.json()

// Submit the sitemap.
const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps/${encodeURIComponent(SITEMAP)}`
const submitRes = await fetch(url, {
  method: 'PUT',
  headers: { authorization: `Bearer ${accessToken}` },
})
if (!submitRes.ok) {
  throw new Error(`Sitemap submit failed (${submitRes.status}): ${await submitRes.text()}`)
}
console.log(`Submitted ${SITEMAP} to Google Search Console (${SITE}).`)
