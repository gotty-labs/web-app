/**
 * Client bootstrap for provider configuration, auth identity synchronization, and
 * best-effort flushing when the browser page is being discarded.
 */
'use client'

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'

import { sessionStore } from '@/features/auth'
import { tracking } from '@/lib/analytics'
import { configureTracking } from '@/lib/analytics/configure-tracking'

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  )
  const currentUserId = useRef<string | null>(null)
  const userId = snapshot.session?.id ?? null

  useEffect(() => {
    configureTracking()
  }, [])

  useEffect(() => {
    if (!snapshot.hydrated || currentUserId.current === userId) return

    if (userId) {
      tracking.setUserId(userId)
    } else {
      tracking.reset()
    }
    currentUserId.current = userId
  }, [snapshot.hydrated, userId])

  useEffect(() => {
    const flush = () => tracking.flush()
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [])

  return children
}
