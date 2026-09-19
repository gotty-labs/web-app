'use client'

import { useStartup } from '@/features/app-config'
import { useSession } from '@/features/auth'

/**
 * Keeps the subtle verification indicators aligned with both the cached session and
 * the authoritative startup response. A successful verification updates the session
 * immediately, while startup corrects a stale unverified profile from another client.
 */
export function useNeedsEmailVerification(): boolean {
  const { startup } = useStartup()
  const { user } = useSession()

  return Boolean(user && !user.twoFa.verifiedEmail && (startup?.needVerifiedEmail ?? true))
}
