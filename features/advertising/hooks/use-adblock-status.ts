'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { adBlockDetectionStore } from '../stores/adblock-store'

export function useAdBlockStatus(enabled: boolean) {
  const status = useSyncExternalStore(
    adBlockDetectionStore.subscribe,
    adBlockDetectionStore.getSnapshot,
    adBlockDetectionStore.getServerSnapshot,
  )

  useEffect(() => {
    if (enabled) adBlockDetectionStore.start()
  }, [enabled])

  return status
}
