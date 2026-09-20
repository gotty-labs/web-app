import { env } from '@/lib/config/env'

import { AmplitudeTrackingDestination } from './amplitude-tracking-destination'
import { ConsoleTrackingDestination } from './console-tracking-destination'
import { tracker } from './tracker'
import type { AnalyticsConsent } from './consent'
import type { TrackingDestination } from './tracking'

let configured = false
let analyticsConsent: AnalyticsConsent = 'denied'
let amplitudeDestination: AmplitudeTrackingDestination | null = null

function getDestinations(): TrackingDestination[] {
  const destinations: TrackingDestination[] = []
  if (env.nodeEnv !== 'production') {
    destinations.push(new ConsoleTrackingDestination())
  }

  if (analyticsConsent === 'granted' && env.analytics.enabled && env.analytics.amplitude.apiKey) {
    amplitudeDestination ??= new AmplitudeTrackingDestination(env.analytics.amplitude.apiKey)
    amplitudeDestination.setEnabled(true)
    destinations.push(amplitudeDestination)
  } else {
    amplitudeDestination?.setEnabled(false)
  }

  return destinations
}

/** Configure analytics once, including under React Strict Mode's development remount. */
export function configureTracking(): void {
  if (configured) return
  configured = true
  tracker.configure(getDestinations())
}

/** Rebuilds destinations after the CMP reports a new settled privacy choice. */
export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  analyticsConsent = consent
  configureTracking()
  tracker.configure(getDestinations())
}
