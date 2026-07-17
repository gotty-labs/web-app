/**
 * Reads the app-scoped startup result provided by `StartupProvider` (QA Chunk 2). The
 * fetch happens once in the provider (mounted in the `(app)` layout); consumers like the
 * verify-email nudge just read the shared state here — no per-component fetching.
 */
'use client'

import { useContext } from 'react'

import { StartupContext, type StartupState } from '../contexts/startup-provider'

export type { StartupState }

export function useStartup(): StartupState {
  const ctx = useContext(StartupContext)
  if (!ctx) {
    throw new Error('useStartup must be used within a StartupProvider.')
  }
  return ctx
}
