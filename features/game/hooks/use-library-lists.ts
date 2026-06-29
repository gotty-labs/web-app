/**
 * Custom library lists loader (Phase 5, Slice F). Fetches `getLibraryLists()` once to
 * populate the list filter. Lists failing to load just leave the filter empty (the
 * status tabs still work), so errors are swallowed here.
 */
'use client'

import { useEffect, useState } from 'react'

import type { GameLibraryList } from '@/lib/domain/models'

import { getLibraryLists } from '../services/library'

export function useLibraryLists(): GameLibraryList[] {
  const [lists, setLists] = useState<GameLibraryList[]>([])

  useEffect(() => {
    let active = true
    getLibraryLists()
      .then((result) => {
        if (active) setLists(result)
      })
      .catch(() => {
        // The list filter is optional; status tabs work without it.
      })
    return () => {
      active = false
    }
  }, [])

  return lists
}
