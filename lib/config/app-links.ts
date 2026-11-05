/**
 * Domain associations that let the native apps open the public HTTPS deep-link catalogue:
 * Universal Links (iOS) and App Links (Android). Published by `app/.well-known/*`.
 *
 * Android signing fingerprints are public deployment data, not secrets. They come from
 * `ANDROID_APP_LINK_SHA256_FINGERPRINTS` (comma-separated) so each deployment authorizes only
 * its own certificates. Without any, no statement is published: an empty list is the honest
 * "nothing authorized yet", never a placeholder value.
 */
import { z } from 'zod'

const APPLE_APP_ID = 'MUDCX7X324.com.gotty.app'
const ANDROID_PACKAGE_NAME = 'com.gotty.app'

// Family matching can deliver partial or longer paths; the apps always apply the strict
// recognition rules. Never widen this to `/*` or `/es/*`: excluded routes must stay on the web.
const APPLE_APP_LINK_PATHS = [
  '/games/*',
  '/es/games/*',
  '/home',
  '/es/home',
  '/library',
  '/es/library',
  '/news',
  '/es/news',
  '/settings',
  '/es/settings',
  '/reset-password',
  '/es/reset-password',
]

const sha256FingerprintSchema = z.string().regex(/^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/)

export function parseAndroidFingerprints(raw: string | undefined): string[] {
  const values = (raw ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  return z.array(sha256FingerprintSchema).parse(values)
}

export function buildAppleAppSiteAssociation() {
  return {
    applinks: {
      apps: [],
      details: [{ appID: APPLE_APP_ID, paths: APPLE_APP_LINK_PATHS }],
    },
  }
}

export function buildAssetLinks(fingerprints: string[]) {
  if (fingerprints.length === 0) return []
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: ANDROID_PACKAGE_NAME,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]
}
