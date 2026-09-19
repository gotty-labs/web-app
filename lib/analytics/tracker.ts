import type { TrackEvent, TrackEventConvertible, Tracking, TrackingDestination } from './tracking'

/** Provider-neutral fan-out tracker, mirroring the native app's analytics core. */
export class Tracker implements Tracking {
  private destinations: readonly TrackingDestination[]

  constructor(destinations: readonly TrackingDestination[] = []) {
    this.destinations = destinations
  }

  configure(destinations: readonly TrackingDestination[]): void {
    this.destinations = [...destinations]
  }

  flush(): void {
    for (const destination of this.destinations) destination.flush()
  }

  reset(): void {
    for (const destination of this.destinations) destination.reset()
  }

  setUserId(userId: string | undefined): void {
    for (const destination of this.destinations) destination.setUserId(userId)
  }

  track(event: TrackEvent): void {
    for (const destination of this.destinations) destination.track(event)
  }
}

export const tracker = new Tracker()
export const tracking: Tracking = tracker

/** Convenience entry point for plain events and feature-specific typed events. */
export function track(event: TrackEvent | TrackEventConvertible): void {
  tracking.track('trackEvent' in event ? event.trackEvent : event)
}
