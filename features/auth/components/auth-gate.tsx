/**
 * Client-side auth gate for the `(app)` zone (Phase 5). Instead of redirecting
 * unauthenticated users away, it renders the undismissable `AuthModal` IN PLACE —
 * matching the UX spec where the web app is always authenticated and login happens
 * through a modal, never a separate page.
 *
 * Three states from `useSession()`:
 *  - `loading`        → the session store is still hydrating from localStorage; show
 *                       a neutral full-screen spinner (avoids a modal flash on reload).
 *  - `authenticated`  → render the app shell (`children`).
 *  - `unauthenticated`→ render the `AuthModal` over an empty backdrop. A successful
 *                       login flips the store to `authenticated` and this swaps to the
 *                       shell with no redirect.
 */
'use client'

import type { ReactNode } from 'react'

import { Spinner } from '@/components/ui/spinner'

import { useSession } from '../hooks/use-session'

import { AuthModal } from './auth-modal'

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-svh bg-background">
        <AuthModal />
      </div>
    )
  }

  return <>{children}</>
}
