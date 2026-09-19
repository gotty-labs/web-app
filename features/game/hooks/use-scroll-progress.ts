'use client'

import { useSyncExternalStore } from 'react'

const COMPRESSION_DISTANCE = 160

function getSnapshot(): number {
  return Math.min(Math.max(window.scrollY / COMPRESSION_DISTANCE, 0), 1)
}

function subscribe(callback: () => void): () => void {
  let frame: number | null = null
  const notify = () => {
    if (frame !== null) return
    frame = window.requestAnimationFrame(() => {
      frame = null
      callback()
    })
  }

  window.addEventListener('scroll', notify, { passive: true })
  window.addEventListener('resize', notify)
  return () => {
    window.removeEventListener('scroll', notify)
    window.removeEventListener('resize', notify)
    if (frame !== null) window.cancelAnimationFrame(frame)
  }
}

/** 0 at the top of the page, 1 once the sticky feed header is fully compressed. */
export function useScrollProgress(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0)
}
