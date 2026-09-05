'use client'

import { useSyncExternalStore } from 'react'

const WIDE_VIEWPORT_QUERY = '(min-width: 90rem)'

function subscribe(callback: () => void): () => void {
  const media = window.matchMedia(WIDE_VIEWPORT_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getSnapshot(): boolean {
  return window.matchMedia(WIDE_VIEWPORT_QUERY).matches
}

function getServerSnapshot(): boolean {
  return false
}

/** Prevents desktop-only units from being requested and then hidden on small screens. */
export function useWideAdViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
