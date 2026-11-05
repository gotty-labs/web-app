import { buildAppleAppSiteAssociation } from '@/lib/config/app-links'

export const dynamic = 'force-static'

export function GET(): Response {
  return new Response(JSON.stringify(buildAppleAppSiteAssociation()), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
