import { InternalCode } from './error-codes'

type Listener = () => void

const listeners = new Set<Listener>()
let active = false

export function isMaintenanceError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'internalCode' in error &&
    error.internalCode === InternalCode.MONGO_UNAVAILABLE
  )
}

export function reportMaintenanceError(error: unknown): void {
  if (typeof window === 'undefined' || !isMaintenanceError(error) || active) return

  active = true
  for (const listener of listeners) listener()
}

export const maintenanceStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot(): boolean {
    return active
  },
  getServerSnapshot(): boolean {
    return false
  },
}
