'use client'

import { useSyncExternalStore } from 'react'

const CARD_AD_VIEWPORT_QUERY = '(min-width: 28rem)'

function subscribe(callback: () => void): () => void {
  const media = window.matchMedia(CARD_AD_VIEWPORT_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getSnapshot(): boolean {
  return window.matchMedia(CARD_AD_VIEWPORT_QUERY).matches
}

function getServerSnapshot(): boolean {
  return false
}

/**
 * At 28rem, a three-column game cover remains at least 120px wide after the
 * page gutters and gaps. Below that, AdSense fixed/display inventory is not a
 * valid fit, so the whole grid/carousel item is omitted before an ad request.
 */
export function useCardAdViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
