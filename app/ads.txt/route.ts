import { env } from '@/lib/config/env'

const GOOGLE_CERTIFICATION_AUTHORITY_ID = 'f08c47fec0942fa0'

export function GET(): Response {
  const clientId = env.advertising.adsense.clientId
  if (!clientId) return new Response(null, { status: 404 })

  const publisherId = clientId.replace(/^ca-/, '')
  return new Response(
    `google.com, ${publisherId}, DIRECT, ${GOOGLE_CERTIFICATION_AUTHORITY_ID}\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  )
}
