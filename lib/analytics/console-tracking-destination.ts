import type { TrackEvent, TrackingDestination } from './tracking'

/** Development-friendly destination equivalent to the native logger destination. */
export class ConsoleTrackingDestination implements TrackingDestination {
  flush(): void {
    console.debug('[Analytics] Flush requested')
  }

  reset(): void {
    console.info('[Analytics] Identity reset')
  }

  setUserId(userId: string | undefined): void {
    console.info(`[Analytics] User changed: ${userId ?? 'anonymous'}`)
  }

  track(event: TrackEvent): void {
    console.info(`[Analytics] Event: ${event.name}`, event.properties ?? {})
  }
}
