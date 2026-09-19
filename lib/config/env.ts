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
  // Analytics is opt-in and its provider key is public by design in the browser bundle.
  NEXT_PUBLIC_ANALYTICS_ENABLED: z.enum(['true', 'false']).optional().default('false'),
  NEXT_PUBLIC_AMPLITUDE_API_KEY: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
  // Advertising is opt-in: an unconfigured build must never request an ad provider.
  NEXT_PUBLIC_ADS_ENABLED: z.enum(['true', 'false']).optional().default('false'),
  NEXT_PUBLIC_ADS_PROVIDER: z.enum(['adsense']).optional().default('adsense'),
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z
      .string()
      .regex(/^ca-pub-\d+$/)
      .optional(),
  ),
  NEXT_PUBLIC_ADSENSE_IN_FEED_SLOT_ID: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().regex(/^\d+$/).optional(),
  ),
  NEXT_PUBLIC_ADSENSE_IN_FEED_LAYOUT_KEY: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
  NEXT_PUBLIC_ADSENSE_FEED_CARD_SLOT_ID: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().regex(/^\d+$/).optional(),
  ),
  NEXT_PUBLIC_ADSENSE_SECTION_DETAIL_CARD_SLOT_ID: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().regex(/^\d+$/).optional(),
  ),
  NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_ID: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().regex(/^\d+$/).optional(),
  ),
  NEXT_PUBLIC_ADSENSE_GAME_DETAIL_SLOT_ID: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().regex(/^\d+$/).optional(),
  ),
})

const validatedClientEnvSchema = clientEnvSchema.superRefine((value, context) => {
  if (value.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' && !value.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
    context.addIssue({
      code: 'custom',
      path: ['NEXT_PUBLIC_AMPLITUDE_API_KEY'],
      message: 'NEXT_PUBLIC_AMPLITUDE_API_KEY is required when NEXT_PUBLIC_ANALYTICS_ENABLED=true',
    })
  }

  if (value.NEXT_PUBLIC_ADS_ENABLED !== 'true') return

  const required = [
    'NEXT_PUBLIC_ADSENSE_CLIENT_ID',
    'NEXT_PUBLIC_ADSENSE_FEED_CARD_SLOT_ID',
    'NEXT_PUBLIC_ADSENSE_SECTION_DETAIL_CARD_SLOT_ID',
    'NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_ID',
    'NEXT_PUBLIC_ADSENSE_GAME_DETAIL_SLOT_ID',
  ] as const

  for (const field of required) {
    if (!value[field]) {
      context.addIssue({
        code: 'custom',
        path: [field],
        message: `${field} is required when NEXT_PUBLIC_ADS_ENABLED=true`,
      })
    }
  }
})

const parsed = validatedClientEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED,
  NEXT_PUBLIC_AMPLITUDE_API_KEY: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
  NEXT_PUBLIC_ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED,
  NEXT_PUBLIC_ADS_PROVIDER: process.env.NEXT_PUBLIC_ADS_PROVIDER,
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
  NEXT_PUBLIC_ADSENSE_IN_FEED_SLOT_ID: process.env.NEXT_PUBLIC_ADSENSE_IN_FEED_SLOT_ID,
  NEXT_PUBLIC_ADSENSE_IN_FEED_LAYOUT_KEY: process.env.NEXT_PUBLIC_ADSENSE_IN_FEED_LAYOUT_KEY,
  NEXT_PUBLIC_ADSENSE_FEED_CARD_SLOT_ID: process.env.NEXT_PUBLIC_ADSENSE_FEED_CARD_SLOT_ID,
  NEXT_PUBLIC_ADSENSE_SECTION_DETAIL_CARD_SLOT_ID:
    process.env.NEXT_PUBLIC_ADSENSE_SECTION_DETAIL_CARD_SLOT_ID,
  NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_ID: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_ID,
  NEXT_PUBLIC_ADSENSE_GAME_DETAIL_SLOT_ID: process.env.NEXT_PUBLIC_ADSENSE_GAME_DETAIL_SLOT_ID,
})

export const env = {
  apiBaseUrl: parsed.NEXT_PUBLIC_API_BASE_URL,
  siteUrl: parsed.NEXT_PUBLIC_SITE_URL,
  nodeEnv: parsed.NEXT_PUBLIC_NODE_ENV,
  googleClientId: parsed.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  analytics: {
    enabled: parsed.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
    amplitude: {
      apiKey: parsed.NEXT_PUBLIC_AMPLITUDE_API_KEY,
    },
  },
  advertising: {
    enabled: parsed.NEXT_PUBLIC_ADS_ENABLED === 'true',
    provider: parsed.NEXT_PUBLIC_ADS_PROVIDER,
    adsense: {
      clientId: parsed.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
      inFeedSlotId: parsed.NEXT_PUBLIC_ADSENSE_IN_FEED_SLOT_ID,
      inFeedLayoutKey: parsed.NEXT_PUBLIC_ADSENSE_IN_FEED_LAYOUT_KEY,
      feedCardSlotId: parsed.NEXT_PUBLIC_ADSENSE_FEED_CARD_SLOT_ID,
      sectionDetailCardSlotId: parsed.NEXT_PUBLIC_ADSENSE_SECTION_DETAIL_CARD_SLOT_ID,
      sidebarSlotId: parsed.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_ID,
      gameDetailSlotId: parsed.NEXT_PUBLIC_ADSENSE_GAME_DETAIL_SLOT_ID,
    },
  },
} as const
