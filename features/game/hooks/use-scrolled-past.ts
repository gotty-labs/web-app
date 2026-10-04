'use client'

import { useMemo, useSyncExternalStore, type RefObject } from 'react'

type ScrolledPastStore = {
  subscribe: (callback: () => void) => () => void
  getSnapshot: () => boolean
}

/** External store over an `IntersectionObserver` watching `target` (built outside render). */
function createScrolledPastStore(target: RefObject<HTMLElement | null>): ScrolledPastStore {
  let scrolledPast = false
  return {
    subscribe(callback) {
      const element = target.current
      if (!element) return () => {}
      const observer = new IntersectionObserver(([entry]) => {
        const next = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0
        if (next === scrolledPast) return
        scrolledPast = next
        callback()
      })
      observer.observe(element)
      return () => observer.disconnect()
    },
    getSnapshot: () => scrolledPast,
  }
}

/**
 * True once `target` has scrolled out through the top of the viewport (false while it
 * is visible or still below). Backed by an `IntersectionObserver`, so nothing runs per
 * scroll frame. `target` must stay mounted for the component's lifetime.
 */
export function useScrolledPast(target: RefObject<HTMLElement | null>): boolean {
  const store = useMemo(() => createScrolledPastStore(target), [target])
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => false)
}
