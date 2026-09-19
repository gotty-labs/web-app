import * as amplitude from '@amplitude/analytics-browser'

import type { TrackEvent, TrackingDestination } from './tracking'

/** Browser SDK adapter; application code never depends on Amplitude directly. */
export class AmplitudeTrackingDestination implements TrackingDestination {
  constructor(apiKey: string) {
    void amplitude
      .init(apiKey, undefined, {
        serverZone: 'EU',
        identityStorage: 'localStorage',
        remoteConfig: { fetchRemoteConfig: false },
        autocapture: {
          sessions: true,
          pageViews: true,
          attribution: false,
          fileDownloads: false,
          formInteractions: false,
          elementInteractions: false,
          frustrationInteractions: false,
          networkTracking: false,
          webVitals: false,
          performanceTracking: false,
        },
      })
      .promise.catch((error: unknown) => {
        console.error('[Analytics] Unable to initialize Amplitude', error)
      })
  }

  flush(): void {
    void amplitude.flush().promise.catch((error: unknown) => {
      console.error('[Analytics] Unable to flush Amplitude events', error)
    })
  }

  reset(): void {
    amplitude.reset()
  }

  setUserId(userId: string | undefined): void {
    amplitude.setUserId(userId)
  }

  track(event: TrackEvent): void {
    void amplitude.track(event.name, event.properties).promise.catch((error: unknown) => {
      console.error(`[Analytics] Unable to track ${event.name}`, error)
    })
  }
}
