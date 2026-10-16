/** The news source slugs hidden on this browser (reactive across components and tabs). */
'use client'

import { useSyncExternalStore } from 'react'

import { hiddenSourcesStore } from '../stores/hidden-sources-store'

export function useHiddenSources(): readonly string[] {
  return useSyncExternalStore(
    hiddenSourcesStore.subscribe,
    hiddenSourcesStore.getSnapshot,
    hiddenSourcesStore.getServerSnapshot,
  )
}
