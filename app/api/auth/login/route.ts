/**
 * BFF login (§4.1). Accepts email or OAuth (Apple/Google), calls the backend
 * server-side, stows the full session in the httpOnly cookie, and returns the
 * access token + profile to the client. The refresh token never reaches the browser.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { apiRequest } from '@/lib/api/client'
import { userSchema } from '@/lib/domain/models'

import { errorResponse, sessionResponse } from '../_shared'

const bodySchema = z.discriminatedUnion('provider', [
  z.object({ provider: z.literal('email'), email: z.string(), password: z.string() }),
  z.object({ provider: z.literal('google'), token: z.string() }),
  z.object({ provider: z.literal('apple'), token: z.string() }),
])

const PATH = {
  email: '/auth/login-email',
  google: '/auth/login-google',
  apple: '/auth/login-apple',
} as const

export async function POST(request: Request): Promise<NextResponse> {
  let input: z.infer<typeof bodySchema>
  try {
    input = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  const backendBody =
    input.provider === 'email'
      ? { email: input.email, password: input.password }
      : { token: input.token }

  try {
    const user = await apiRequest({
      method: 'POST',
      path: PATH[input.provider],
      body: backendBody,
      schema: userSchema,
    })
    return await sessionResponse(user)
  } catch (error) {
    return errorResponse(error)
  }
}
