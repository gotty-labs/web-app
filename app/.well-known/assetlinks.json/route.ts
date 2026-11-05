import { buildAssetLinks, parseAndroidFingerprints } from '@/lib/config/app-links'

// Rendered at build: a malformed fingerprint fails the build instead of being published, and
// changing `ANDROID_APP_LINK_SHA256_FINGERPRINTS` requires a new deployment.
export const dynamic = 'force-static'

export function GET(): Response {
  const fingerprints = parseAndroidFingerprints(process.env.ANDROID_APP_LINK_SHA256_FINGERPRINTS)

  return new Response(JSON.stringify(buildAssetLinks(fingerprints)), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
