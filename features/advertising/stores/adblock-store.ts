/**
 * Observable AdBlock detection and the persistent "continue anyway" preference.
 * The script callbacks provide the strongest signal; the bait catches cosmetic
 * blockers that hide ad containers while allowing the provider script itself.
 */
const CONTINUED_STORAGE_KEY = 'gt:adblock-continued'

export type AdBlockStatus = 'idle' | 'checking' | 'allowed' | 'blocked'
type Listener = () => void

const detectionListeners = new Set<Listener>()
const preferenceListeners = new Set<Listener>()

let status: AdBlockStatus = 'idle'
let detectionStarted = false

function readContinued(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(CONTINUED_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

let continued = readContinued()

function emit(listeners: Set<Listener>) {
  for (const listener of listeners) listener()
}

function setStatus(nextStatus: AdBlockStatus) {
  if (status === nextStatus || status === 'blocked') return
  status = nextStatus
  emit(detectionListeners)
}

export const adBlockDetectionStore = {
  subscribe(listener: Listener): () => void {
    detectionListeners.add(listener)
    return () => detectionListeners.delete(listener)
  },
  getSnapshot: (): AdBlockStatus => status,
  getServerSnapshot: (): AdBlockStatus => 'idle',
  start(): void {
    if (detectionStarted || typeof document === 'undefined') return
    detectionStarted = true
    setStatus('checking')

    const bait = document.createElement('div')
    bait.className = 'adsbox ad-banner advertisement ad-placement adsbygoogle'
    bait.setAttribute('aria-hidden', 'true')
    bait.style.cssText =
      'position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;pointer-events:none;'
    document.body.append(bait)

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const styles = window.getComputedStyle(bait)
        const blocked =
          !bait.isConnected ||
          bait.offsetHeight === 0 ||
          bait.clientHeight === 0 ||
          styles.display === 'none' ||
          styles.visibility === 'hidden'

        bait.remove()
        setStatus(blocked ? 'blocked' : 'allowed')
      }, 100)
    })
  },
  reportScriptLoaded(): void {
    setStatus('allowed')
  },
  reportScriptBlocked(): void {
    setStatus('blocked')
  },
}

export const adBlockPreferenceStore = {
  subscribe(listener: Listener): () => void {
    preferenceListeners.add(listener)
    return () => preferenceListeners.delete(listener)
  },
  getSnapshot: (): boolean => continued,
  getServerSnapshot: (): boolean => true,
  continue(): void {
    if (continued) return
    continued = true
    try {
      window.localStorage.setItem(CONTINUED_STORAGE_KEY, '1')
    } catch {
      // Best effort: memory still prevents repeats in the current document.
    }
    emit(preferenceListeners)
  },
}
