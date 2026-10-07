/**
 * Open state of the auth prompt (the `AuthModal` shown over a guest session), as an
 * observable store so any feature can raise it without prop-drilling — a guest tapping
 * "Sign in" on the library, a gated console-visibility click, the detail page's "Sign in
 * to save" — and a single mounted `AuthPrompt` renders it.
 *
 * Besides those explicit requests, guests get the prompt once at the start of a visit
 * (the web equivalent of the apps' "every launch"). That is tracked per browser tab in
 * `sessionStorage`: it survives reloads and resets when the tab closes.
 */
const STARTUP_STORAGE_KEY = 'gt:auth-prompt-shown'

type Listener = () => void
const listeners = new Set<Listener>()

let open = false
let startupShownInMemory = false

function emit() {
  for (const listener of listeners) listener()
}

function wasStartupShown(): boolean {
  if (startupShownInMemory) return true
  try {
    return window.sessionStorage.getItem(STARTUP_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function setStartupShown(shown: boolean) {
  startupShownInMemory = shown
  try {
    if (shown) window.sessionStorage.setItem(STARTUP_STORAGE_KEY, '1')
    else window.sessionStorage.removeItem(STARTUP_STORAGE_KEY)
  } catch {
    // In-memory state still applies while this document remains open.
  }
}

export const authPromptStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: (): boolean => open,
  getServerSnapshot: (): boolean => false,
  /** Opens on explicit user intent (a gated action). */
  show(): void {
    if (open) return
    open = true
    emit()
  },
  /** Opens the start-of-visit prompt unless it already ran in this tab. */
  requestStartup(): void {
    if (typeof window === 'undefined' || wasStartupShown()) return
    setStartupShown(true)
    authPromptStore.show()
  },
  /** Re-arms the start-of-visit prompt (after a lost session, the user re-chooses). */
  resetStartup(): void {
    setStartupShown(false)
  },
  dismiss(): void {
    if (!open) return
    open = false
    emit()
  },
}
