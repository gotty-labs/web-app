/**
 * App-scoped startup gate (QA Chunk 2). `GET /config/startup` is the FIRST business
 * call after a session and must run EXACTLY ONCE per authenticated web entry —
 * independent of route. So it lives here, mounted once in the `(app)` layout inside
 * `AuthGate`, and shared via context; navigating between /home, /library, … reuses the
 * same result instead of refetching.
 *
 * The `useRef` guard makes the fetch fire once even under React StrictMode's double
 * effect invocation (dev). That matters beyond tidiness: the previous per-mount hook
 * used an `active` flag that committed the SECOND strict call's result — so a losing
 * race on that duplicate could leave `startup: null` and silently swallow a real
 * `needVerifiedEmail`. One guarded call removes the race entirely.
 */
'use client'

import { createContext, useEffect, useRef, useState, type ReactNode } from 'react'

import type { Startup } from '@/lib/domain/models'

import { getStartup } from '../services/startup-client'

export interface StartupState {
  loading: boolean
  startup: Startup | null
  error: unknown
}

export const StartupContext = createContext<StartupState | null>(null)

export function StartupProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StartupState>({
    loading: true,
    startup: null,
    error: null,
  })
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    getStartup()
      .then((startup) => setState({ loading: false, startup, error: null }))
      .catch((error) => setState({ loading: false, startup: null, error }))
  }, [])

  return <StartupContext value={state}>{children}</StartupContext>
}
