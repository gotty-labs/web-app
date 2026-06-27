/**
 * Client-side guard for the authenticated app (`/home` and descendants).
 *
 * Because the access token lives in localStorage (not a server-readable cookie),
 * the "always authenticated" gate is enforced on the client: render the children
 * only when authenticated, otherwise show `fallback` and redirect to login.
 *
 * Wrap the `(app)` route group's layout with this. If we later want a server-side
 * gate (e.g. to SSR authed content), we'd expose a server-readable signal too.
 */
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

import { LOGIN_PATH } from '../config/config'
import { useSession } from '../hooks/use-session'

export function RequireAuth({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(LOGIN_PATH)
    }
  }, [status, router])

  if (status !== 'authenticated') {
    return <>{fallback}</>
  }
  return <>{children}</>
}
