/**
 * Onboarding "seen" flag (Phase 5, Slice G). A tiny observable store backed by
 * localStorage, consumed via `useSyncExternalStore` (the codebase's pattern for
 * external/browser state — no setState-in-effect).
 *
 * `getServerSnapshot` returns `true` (treated as already onboarded) so the welcome
 * modal never renders during SSR / the first client paint, avoiding a hydration
 * mismatch; after mount the real localStorage value takes over.
 *
 * NOTE: this is a CLIENT-side first-run gate. If the backend later exposes a
 * first-login signal (e.g. on `config/startup`), switch the source here.
 */
const STORAGE_KEY = 'gt:onboarded'

type Listener = () => void
const listeners = new Set<Listener>()

function readSeen(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

let seen = readSeen()

export const onboardingStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: (): boolean => seen,
  getServerSnapshot: (): boolean => true,
  markSeen(): void {
    if (seen) return
    seen = true
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        // best-effort; a non-persistable env just re-shows onboarding next load
      }
    }
    for (const listener of listeners) listener()
  },
}
