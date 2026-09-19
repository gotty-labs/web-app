import { env } from '@/lib/config/env'

import { AmplitudeTrackingDestination } from './amplitude-tracking-destination'
import { ConsoleTrackingDestination } from './console-tracking-destination'
import { tracker } from './tracker'
import type { TrackingDestination } from './tracking'

let configured = false

/** Configure analytics once, including under React Strict Mode's development remount. */
export function configureTracking(): void {
  if (configured) return

  const destinations: TrackingDestination[] = []
  if (env.nodeEnv !== 'production') {
    destinations.push(new ConsoleTrackingDestination())
  }
  if (env.analytics.enabled && env.analytics.amplitude.apiKey) {
    destinations.push(new AmplitudeTrackingDestination(env.analytics.amplitude.apiKey))
  }

  tracker.configure(destinations)
  configured = true
}
