/**
 * Filter options loader (Phase 5, Slice D). Fetches `GET /game/filter` once on mount
 * — the genres/themes/consoles that populate the search filter controls. Same
 * fetch-in-effect / setState-in-callback shape as `useFeed`.
 */
'use client'

import { useEffect, useState } from 'react'

import type { GameFilterOptions } from '@/lib/domain/models'

import { getFilterOptions } from '../services/catalog'

export interface FilterOptionsState {
  loading: boolean
  options: GameFilterOptions | null
  error: unknown
}

export function useFilterOptions(): FilterOptionsState {
  const [state, setState] = useState<FilterOptionsState>({
    loading: true,
    options: null,
    error: null,
  })

  useEffect(() => {
    let active = true
    getFilterOptions()
      .then((options) => {
        if (active) setState({ loading: false, options, error: null })
      })
      .catch((error) => {
        if (active) setState({ loading: false, options: null, error })
      })
    return () => {
      active = false
    }
  }, [])

  return state
}
