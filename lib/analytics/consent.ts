export type AnalyticsConsent = 'granted' | 'denied'

type TcfData = {
  eventStatus?: string
  gdprApplies?: boolean
  listenerId?: number
  purpose?: {
    consents?: Record<string, boolean>
  }
}

type TcfCallback = (data: TcfData, success: boolean) => void

type TcfApi = (
  command: 'addEventListener' | 'removeEventListener',
  version: 2,
  callback: TcfCallback,
  parameter?: number,
) => void

declare global {
  interface Window {
    __tcfapi?: TcfApi
  }
}

const settledEventStatuses = new Set(['tcloaded', 'useractioncomplete'])
const measurementPurposes = ['7', '8', '9', '10']

function getConsent(data: TcfData): AnalyticsConsent | null {
  if (!data.eventStatus || !settledEventStatuses.has(data.eventStatus)) return null
  if (data.gdprApplies === false) return 'granted'
  if (data.gdprApplies !== true) return 'denied'

  const consents = data.purpose?.consents ?? {}
  const hasStorageConsent = consents['1'] === true
  const hasMeasurementConsent = measurementPurposes.some((purpose) => consents[purpose] === true)

  return hasStorageConsent && hasMeasurementConsent ? 'granted' : 'denied'
}

/**
 * Subscribes to the IAB TCF callback exposed by Google's certified CMP. Analytics
 * stays disabled until the CMP reports a settled choice, which also makes the
 * safe default explicit when the CMP is unavailable.
 */
export function subscribeToAnalyticsConsent(onChange: (consent: AnalyticsConsent) => void): () => void {
  let cancelled = false
  let attempts = 0
  let timeoutId: number | undefined
  let api: TcfApi | undefined
  let listenerId: number | undefined

  const connect = () => {
    if (cancelled) return

    api = window.__tcfapi
    if (!api) {
      attempts += 1
      if (attempts >= 40) {
        onChange('denied')
        return
      }
      timeoutId = window.setTimeout(connect, 250)
      return
    }

    api('addEventListener', 2, (data, success) => {
      if (cancelled) return
      if (!success) {
        onChange('denied')
        return
      }

      listenerId = data.listenerId
      const consent = getConsent(data)
      if (consent) onChange(consent)
    })
  }

  connect()

  return () => {
    cancelled = true
    if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    if (api && listenerId !== undefined) {
      api('removeEventListener', 2, () => undefined, listenerId)
    }
  }
}
