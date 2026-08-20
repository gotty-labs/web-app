/**
 * Client-side auth use-cases (Phase 2 core). These talk to our BFF routes via the
 * `bffRequest` contract (NOT the backend directly), so the refresh token stays
 * server-side. On success they stash the working access token in the session store.
 *
 * Errors surface as `BffError` — branch on `BffError.internalCode` in the UI (§3):
 * e.g. 50040 INVALID_CREDENTIALS → inline form error; 50046 INVALID_OAUTH_CREDENTIALS
 * → route to OAuth register.
 *
 * Still TODO (next slice): forgot-password, reset-password, delete-account, and a
 * React session context that wires `setOnSessionExpired` to the router.
 */
import { z } from 'zod'

import { bffRequest } from '@/lib/api/bff-client'
import { apiRequest } from '@/lib/api/client'
import { voidDataSchema } from '@/lib/api/envelope'
import { userProfileSchema, type UserProfile } from '@/lib/domain/models'

import { authedRequest } from './authed-request'
import { sessionStore } from '../stores/session-store'

const sessionPayloadSchema = z.object({
  id: z.string(),
  accessToken: z.string(),
  user: userProfileSchema,
})
type SessionPayload = z.infer<typeof sessionPayloadSchema>

function persist(payload: SessionPayload): UserProfile {
  sessionStore.setSession({
    id: payload.id,
    accessToken: payload.accessToken,
    user: payload.user,
  })
  return payload.user
}

export async function loginEmail(email: string, password: string): Promise<UserProfile> {
  return persist(
    await bffRequest({
      path: '/api/auth/login',
      body: { provider: 'email', email, password },
      schema: sessionPayloadSchema,
    }),
  )
}

export async function loginOAuth(
  provider: 'google' | 'apple',
  token: string,
): Promise<UserProfile> {
  return persist(
    await bffRequest({
      path: '/api/auth/login',
      body: { provider, token },
      schema: sessionPayloadSchema,
    }),
  )
}

export async function registerEmail(
  email: string,
  nickname: string,
  password: string,
): Promise<UserProfile> {
  return persist(
    await bffRequest({
      path: '/api/auth/register',
      body: { provider: 'email', email, nickname, password },
      schema: sessionPayloadSchema,
    }),
  )
}

export async function registerOAuth(
  provider: 'google' | 'apple',
  token: string,
  nickname: string,
): Promise<UserProfile> {
  return persist(
    await bffRequest({
      path: '/api/auth/register',
      body: { provider, token, nickname },
      schema: sessionPayloadSchema,
    }),
  )
}

export async function logout(): Promise<void> {
  try {
    await bffRequest({ path: '/api/auth/logout' })
  } finally {
    sessionStore.clear()
  }
}

/**
 * Forgot-password (§4.1). PUBLIC backend endpoint, no session → called directly
 * via `apiRequest` (carril 1), NOT the BFF. Errors surface as `ApiException`.
 */
export async function forgotPassword(email: string): Promise<void> {
  await apiRequest({
    method: 'POST',
    path: '/auth/forgot-password',
    body: { email },
    schema: voidDataSchema,
  })
}

/**
 * Reset-password (§4.1). PUBLIC; `resetId` comes from the email link. This is the
 * one endpoint that does NOT require the `gt-*` headers — sending them anyway is
 * harmless (extra valid headers are ignored).
 */
export async function resetPassword(resetId: string, password: string): Promise<void> {
  await apiRequest({
    method: 'PATCH',
    path: '/auth/reset-password',
    body: { resetId, password },
    schema: voidDataSchema,
  })
}

/**
 * Delete-account (§4.1). A Member endpoint that also ends the session, so it
 * combines both channels: the authenticated DELETE goes direct to the backend via
 * `authedRequest` (token + refresh handled), then `logout()` clears the httpOnly
 * cookie and the client store (its best-effort backend logout no-ops post-delete).
 */
export async function deleteAccount(): Promise<void> {
  await authedRequest({
    method: 'DELETE',
    path: '/auth/delete-account',
    schema: voidDataSchema,
  })
  await logout()
}
