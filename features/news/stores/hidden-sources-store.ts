/**
 * The news sources hidden on THIS browser (a set of slugs in `localStorage`). Not tied
 * to an account and never sent to the backend for storage: two accounts sharing a
 * browser share it, and signing out keeps it. It only takes effect with a member
 * session (the screen decides that, not the store).
 *
 * Observable for `useSyncExternalStore`; the snapshot is cached per raw value so it
 * stays referentially stable, and other tabs' writes arrive through `storage` events.
 * A corrupt value reads as "nothing hidden".
 */
import { parseHiddenSources } from '../utils/rules'

const STORAGE_KEY = 'gt:news-hidden-sources'
const EMPTY: readonly string[] = []

type Listener = () => void
const listeners = new Set<Listener>()

let cachedRaw: string | null = null
let cachedValue: readonly string[] = EMPTY

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function emit() {
  for (const listener of listeners) listener()
}

function onStorage(event: StorageEvent) {
  if (event.key === null || event.key === STORAGE_KEY) emit()
}

export const hiddenSourcesStore = {
  subscribe(listener: Listener): () => void {
    if (listeners.size === 0) window.addEventListener('storage', onStorage)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) window.removeEventListener('storage', onStorage)
    }
  },
  getSnapshot(): readonly string[] {
    const raw = readRaw()
    if (raw !== cachedRaw) {
      cachedRaw = raw
      cachedValue = parseHiddenSources(raw)
    }
    return cachedValue
  },
  getServerSnapshot: (): readonly string[] => EMPTY,
  set(slugs: readonly string[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(slugs)]))
    } catch {
      // Storage unavailable (private mode, quota): the filter just doesn't persist.
    }
    emit()
  },
}
