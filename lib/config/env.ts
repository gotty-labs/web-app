/**
 * Typed, validated access to public environment variables.
 *
 * Two gotchas this file handles on purpose:
 *  1. `NEXT_PUBLIC_*` vars are inlined into the bundle at build time ONLY when
 *     referenced by their full static name. So we read each one explicitly here
 *     (never `clientEnvSchema.parse(process.env)`, which wouldn't inline on the
 *     client and would be `undefined` in the browser).
 *  2. We validate at module load and fail fast: a missing/invalid URL throws here
 *     instead of producing confusing `fetch(undefined)` errors deep in a request.
 */
import { z } from 'zod'

const clientEnvSchema = z.object({
  // Backend base, including the `/api/v1` prefix, e.g. http://localhost:3000/api/v1
  NEXT_PUBLIC_API_BASE_URL: z.url(),
  // Public web domain, used for sitemap absolute URLs and canonical/OG metadata.
  NEXT_PUBLIC_SITE_URL: z.url(),
  // Node environment
  NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'production', 'local']),
  // Google Identity Services OAuth client id. Optional so email auth still works while
  // Google OAuth is not configured in a given environment.
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
})

const parsed = clientEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
})

export const env = {
  apiBaseUrl: parsed.NEXT_PUBLIC_API_BASE_URL,
  siteUrl: parsed.NEXT_PUBLIC_SITE_URL,
  nodeEnv: parsed.NEXT_PUBLIC_NODE_ENV,
  googleClientId: parsed.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
} as const
