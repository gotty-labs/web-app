/**
 * Client-side session store, modeled as an OBSERVABLE external store so React can
 * read it via `useSyncExternalStore` (no effects, no setState-in-effect, SSR-safe).
 *
 * Holds the short-lived (~2h) access token the browser needs for direct backend
 * calls, plus the (non-sensitive) user profile so a reload paints the user with
 * zero network. The ~6-month refresh token is NOT here — it stays httpOnly.
 *
 * Snapshot shape `{ session, hydrated }`:
 *  - `hydrated` lets the UI show a 'loading' state until localStorage is read,
 *    avoiding an "unauthenticated" flash (and redirect) on first paint.
 *  - The snapshot reference only changes on write/storage events, so
 *    `useSyncExternalStore` stays stable.
 *
 * Two setters: `setSession` (full, on login/register) and `setAccess` (token-only,
 * on refresh — preserves the existing profile).
 */
import type { UserProfile } from '@/lib/domain/models'

const STORAGE_KEY = 'jg.session'

export interface ClientSession {
  id: string
  accessToken: string
  user: UserProfile | null
}

interface Snapshot {
  session: ClientSession | null
  hydrated: boolean
}

const SERVER_SNAPSHOT: Snapshot = { session: null, hydrated: false }
let clientSnapshot: Snapshot = { session: null, hydrated: false }

const listeners = new Set<() => void>()
function emit(): void {
  for (const listener of listeners) listener()
}

function load(): void {
  if (clientSnapshot.hydrated) return
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    clientSnapshot = {
      session: raw ? (JSON.parse(raw) as ClientSession) : null,
      hydrated: true,
    }
  } catch {
    clientSnapshot = { session: null, hydrated: true }
  }
}

function write(session: ClientSession | null): void {
  clientSnapshot = { session, hydrated: true }
  if (typeof window !== 'undefined') {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }
  emit()
}

// Cross-tab sync: another tab logging in/out updates this tab's snapshot.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      clientSnapshot = { ...clientSnapshot, hydrated: false }
      load()
      emit()
    }
  })
}

export const sessionStore = {
  // --- useSyncExternalStore wiring ---
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot(): Snapshot {
    load()
    return clientSnapshot
  },
  getServerSnapshot(): Snapshot {
    return SERVER_SNAPSHOT
  },

  // --- imperative access (used outside React, e.g. the request interceptor) ---
  getAccessToken: (): string | null => {
    load()
    return clientSnapshot.session?.accessToken ?? null
  },
  getId: (): string | null => {
    load()
    return clientSnapshot.session?.id ?? null
  },
  setSession: (session: ClientSession): void => write(session),
  setAccess: (partial: { id: string; accessToken: string }): void => {
    load()
    write({
      id: partial.id,
      accessToken: partial.accessToken,
      user: clientSnapshot.session?.user ?? null,
    })
  },
  clear: (): void => write(null),
}
