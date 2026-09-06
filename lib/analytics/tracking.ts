/** JSON-compatible values accepted by every analytics destination. */
export type TrackingValue =
  boolean | number | string | null | TrackingValue[] | { [key: string]: TrackingValue }

export type TrackingProperties = Record<string, TrackingValue>

/** Provider-neutral event passed through the tracking pipeline. */
export interface TrackEvent {
  readonly name: string
  readonly properties?: TrackingProperties
}

/** Lets feature-specific event models expose their provider-neutral representation. */
export interface TrackEventConvertible {
  readonly trackEvent: TrackEvent
}

/** Generic analytics contract consumed by the application. */
export interface Tracking {
  flush(): void
  reset(): void
  setUserId(userId: string | undefined): void
  track(event: TrackEvent): void
}

/** Implement this contract to fan events out to an additional analytics provider. */
export type TrackingDestination = Tracking
