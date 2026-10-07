/**
 * BFF guest login. Creates (or resumes) the guest account bound to this browser's
 * device id and stows its session in the httpOnly cookie exactly like a member login,
 * so the guest refresh token never reaches the browser either. Guests carry no
 * profile: the client receives only the working access token + id.
 */
import { NextResponse } from 'next/server'

import { getOrCreateDeviceId } from '@/features/auth/server/device-cookie'
import { persistSession } from '@/features/auth/server/session-cookie'
import { apiRequest } from '@/lib/api/client'
import { retryOnConnectionFailure } from '@/lib/api/retry'
import { userSessionSchema } from '@/lib/domain/models'

import { errorResponse } from '../_shared'

export async function POST(): Promise<NextResponse> {
  try {
    const deviceId = await getOrCreateDeviceId()
    const session = await retryOnConnectionFailure(() =>
      apiRequest({
        method: 'POST',
        path: '/auth/login-guest',
        deviceId,
        schema: userSessionSchema,
      }),
    )

    await persistSession(session)
    return NextResponse.json({ id: session.id, accessToken: session.sessionToken })
  } catch (error) {
    return errorResponse(error)
  }
}
