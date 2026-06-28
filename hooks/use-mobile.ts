import * as React from 'react'

const MOBILE_BREAKPOINT = 768

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

// React 19-friendly (avoids setState-in-effect): read the media query as an
// external store. SSR snapshot defaults to desktop (false).
export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  )
}
