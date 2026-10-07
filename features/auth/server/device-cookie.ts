/**
 * Server-side browser identity for guest sessions.
 *
 * The backend keys guest accounts on a per-device id (the native apps send their
 * vendor/install id). The web equivalent is a random UUID minted once per browser and
 * kept in an httpOnly cookie, so the same browser keeps resolving to the same guest
 * across visits. It is independent from the session cookie: logging out (or an expired
 * session) never rotates it.
 *
 * Server-only by construction (`next/headers`), like `session-cookie.ts`.
 */
import { cookies } from 'next/headers'
import { z } from 'zod'

import { env } from '@/lib/config/env'

const COOKIE_NAME = 'gt_device'
/** 400 days — the longest cookie lifetime browsers honor. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 400

/** Returns this browser's device id, minting and persisting it on first use. */
export async function getOrCreateDeviceId(): Promise<string> {
  const store = await cookies()
  const current = z.uuid().safeParse(store.get(COOKIE_NAME)?.value)
  if (current.success) return current.data

  const deviceId = crypto.randomUUID()
  store.set(COOKIE_NAME, deviceId, {
    httpOnly: true,
    // localhost is http in dev; `secure` would drop the cookie there.
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
  return deviceId
}
