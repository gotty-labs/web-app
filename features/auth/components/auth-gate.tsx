/**
 * Client session gate for the `(app)` zone. The app is usable WITHOUT an account, like
 * the native apps: a visitor with no session gets a guest session silently, so the
 * real feed renders immediately and member-only features are gated in place (see
 * `authPromptStore`). The start-of-visit auth prompt is raised by the shell.
 *
 * States from `useSession()`:
 *  - `loading`             → the session store is still hydrating from localStorage;
 *                            neutral full-screen spinner (avoids a flash on reload).
 *  - `unauthenticated`     → bootstrap a guest session (spinner meanwhile). If that
 *                            fails, fall back to the `AuthModal`, whose "Continue as
 *                            guest" retries it.
 *  - `guest`/`authenticated` → render the app shell (`children`).
 */
'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { Spinner } from '@/components/ui/spinner'

import { useSession } from '../hooks/use-session'
import { loginAsGuest } from '../services/auth-client'

import { AuthModal } from './auth-modal'

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [bootstrapFailed, setBootstrapFailed] = useState(false)

  useEffect(() => {
    if (status !== 'unauthenticated' || bootstrapFailed) return
    loginAsGuest().catch(() => setBootstrapFailed(true))
  }, [status, bootstrapFailed])

  if (status === 'unauthenticated' && bootstrapFailed) {
    return (
      <div className="min-h-svh bg-background">
        <AuthModal />
      </div>
    )
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
