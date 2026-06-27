/**
 * One-shot client hook for the startup gate. Fetches `config/startup` once on
 * mount and exposes the result; the verify-email nudge UI (Phase 5) reads
 * `startup?.needVerifiedEmail` from here.
 *
 * setState lives inside the async `.then`/`.catch` (not synchronously in the
 * effect body), so it doesn't trip the React 19 `set-state-in-effect` rule. The
 * `active` flag guards against setting state after unmount.
 */
'use client'

import { useEffect, useState } from 'react'

import type { Startup } from '@/lib/domain/models'

import { getStartup } from '../services/startup-client'

export interface StartupState {
  loading: boolean
  startup: Startup | null
  error: unknown
}

export function useStartup(): StartupState {
  const [state, setState] = useState<StartupState>({
    loading: true,
    startup: null,
    error: null,
  })

  useEffect(() => {
    let active = true
    getStartup()
      .then((startup) => {
        if (active) setState({ loading: false, startup, error: null })
      })
      .catch((error) => {
        if (active) setState({ loading: false, startup: null, error })
      })
    return () => {
      active = false
    }
  }, [])

  return state
}
