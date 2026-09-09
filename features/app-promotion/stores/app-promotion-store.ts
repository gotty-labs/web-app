/**
 * One app-download prompt per browser-tab session. `sessionStorage` survives reloads
 * but is cleared when the tab closes, which matches the product requirement.
 */
const STORAGE_KEY = 'gt:app-download-prompt-shown'
const MOBILE_QUERY = '(max-width: 767px)'

type Listener = () => void
const listeners = new Set<Listener>()

let open = false
let shownInMemory = false
let afterDismiss: (() => void) | undefined

function emit() {
  for (const listener of listeners) listener()
}

function wasShownThisSession(): boolean {
  if (shownInMemory) return true
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markShownThisSession() {
  shownInMemory = true
  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // In-memory state still prevents repeats while this document remains open.
  }
}

export const appPromotionStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: (): boolean => open,
  getServerSnapshot: (): boolean => false,
  request(onDismiss?: () => void): boolean {
    if (
      typeof window === 'undefined' ||
      open ||
      wasShownThisSession() ||
      !window.matchMedia(MOBILE_QUERY).matches
    ) {
      return false
    }

    markShownThisSession()
    afterDismiss = onDismiss
    open = true
    emit()
    return true
  },
  dismiss(): void {
    if (!open) return
    open = false
    const callback = afterDismiss
    afterDismiss = undefined
    emit()
    callback?.()
  },
}
