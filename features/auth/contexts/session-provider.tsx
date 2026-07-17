/**
 * React session provider + context — the app-facing surface of the auth feature.
 *
 * Derives entirely from the observable `sessionStore` via `useSyncExternalStore`,
 * so it's reactive with no effects: any store update (login, refresh, a failed
 * refresh calling `clear()`) re-renders every `useSession()` consumer. On expiry,
 * `AuthGate` reacts to `status` and shows the auth modal in place.
 *
 * The `useSession` hook lives in `../hooks/use-session` (per the hooks/ convention);
 * the raw `SessionContext` is exported here for it to consume.
 */
'use client'

import { useRouter } from 'next/navigation'
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

import { LOGIN_PATH } from '../config/config'
import { logout as authLogout } from '../services/auth-client'
import { setOnSessionExpired } from '../services/authed-request'
import { sessionStore } from '../stores/session-store'

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface SessionContextValue {
  status: SessionStatus
  user: UserProfile | null
  signOut: () => Promise<void>
  markEmailVerified: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const dict = useDictionary()
  const snapshot = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  )

  // Centralized hard-session-loss handling: `authedRequest`'s `hardLogout` fires this
  // when a refresh can't be recovered. Registering the callback here (not calling
  // setState in the effect body) keeps the `set-state-in-effect` rule happy. On expiry
  // we surface a blocking alert WITHOUT clearing the session, so the user still sees their
  // last screen behind it; acknowledging it clears the session and routes to the landing.
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    setOnSessionExpired(() => setExpired(true))
    return () => setOnSessionExpired(null)
  }, [])

  const status: SessionStatus = !snapshot.hydrated
    ? 'loading'
    : snapshot.session
      ? 'authenticated'
      : 'unauthenticated'
  const user = snapshot.session?.user ?? null

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      signOut: async () => {
        await authLogout()
        router.replace(LOGIN_PATH)
      },
      markEmailVerified: () => sessionStore.setEmailVerified(),
    }),
    [status, user, router],
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
                sessionStore.clear()
                router.replace('/')
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
