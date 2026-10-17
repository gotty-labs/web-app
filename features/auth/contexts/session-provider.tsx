/**
 * React session provider + context — the app-facing surface of the auth feature.
 *
 * Derives entirely from the observable `sessionStore` via `useSyncExternalStore`,
 * so it's reactive with no effects: any store update (login, refresh, a failed
 * refresh calling `clear()`) re-renders every `useSession()` consumer.
 *
 * `status` mirrors the native apps' three session states plus hydration:
 *  - `loading`         → localStorage not read yet.
 *  - `unauthenticated` → no session at all (the `(app)` gate bootstraps a guest).
 *  - `guest`           → anonymous session: browse-only, member features are gated.
 *  - `authenticated`   → member session with a profile.
 *
 * Signing out drops the member straight into a fresh guest session (as the apps do),
 * and a lost session re-arms the start-of-visit auth prompt.
 *
 * The `useSession` hook lives in `../hooks/use-session` (per the hooks/ convention);
 * the raw `SessionContext` is exported here for it to consume.
 */
'use client'

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { UserProfile } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { loginAsGuest, logout as authLogout } from '../services/auth-client'
import { setOnSessionExpired } from '../services/authed-request'
import { authPromptStore } from '../stores/auth-prompt-store'
import { sessionStore } from '../stores/session-store'

export type SessionStatus = 'loading' | 'unauthenticated' | 'guest' | 'authenticated'

export interface SessionContextValue {
  status: SessionStatus
  user: UserProfile | null
  signOut: () => Promise<void>
  markEmailVerified: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const dict = useDictionary()
  const snapshot = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  )

  // An expired guest can restart anonymously through AuthGate; no account decision
  // is needed. Members keep the explicit expiry alert so account loss is visible.
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    setOnSessionExpired(() => {
      const current = sessionStore.getSnapshot().session
      if (!current) return
      if (current.guest) {
        sessionStore.clear()
        return
      }
      setExpired(true)
    })
    return () => setOnSessionExpired(null)
  }, [])

  const status: SessionStatus = !snapshot.hydrated
    ? 'loading'
    : !snapshot.session
      ? 'unauthenticated'
      : snapshot.session.guest
        ? 'guest'
        : 'authenticated'
  const user = snapshot.session?.guest ? null : (snapshot.session?.user ?? null)

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      signOut: async () => {
        await authLogout()
        // Best effort: if it fails, the `(app)` gate offers the auth modal instead.
        await loginAsGuest().catch(() => {})
      },
      markEmailVerified: () => sessionStore.setEmailVerified(),
    }),
    [status, user],
  )

  return (
    <SessionContext value={value}>
      {children}
      <AlertDialog open={expired}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{dict.app.sessionExpired.title}</AlertDialogTitle>
            <AlertDialogDescription>{dict.app.sessionExpired.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                // Clear the (now invalid) session ONLY now — deferring it to here is what
                // keeps the user's last screen behind the alert instead of the login flow.
                // The `(app)` gate then starts a new guest and the auth prompt shows again.
                setExpired(false)
                authPromptStore.resetStartup()
                sessionStore.clear()
              }}
            >
              {dict.app.sessionExpired.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SessionContext>
  )
}
