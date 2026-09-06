/** Custom-list controller: load, refresh and create while keeping one shared state. */
'use client'

import { useCallback, useEffect, useState } from 'react'

import type { CreateLibraryListInput } from '@/lib/domain/inputs'
import type { GameLibraryList } from '@/lib/domain/models'

import { createLibraryList, deleteLibraryList, getLibraryLists } from '../services/library'

export interface LibraryListsState {
  lists: GameLibraryList[]
  loading: boolean
  error: unknown
  refresh: () => Promise<void>
  create: (input: CreateLibraryListInput) => Promise<GameLibraryList>
  remove: (listId: string) => Promise<void>
}

export function useLibraryLists(): LibraryListsState {
  const [lists, setLists] = useState<GameLibraryList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setLists(await getLibraryLists())
    } catch (nextError) {
      setError(nextError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getLibraryLists()
      .then((result) => {
        if (active) setLists(result)
      })
      .catch((nextError: unknown) => {
        if (active) setError(nextError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const create = useCallback(
    async (input: CreateLibraryListInput) => {
      try {
        const created = await createLibraryList(input)
        setLists((current) => [...current, created])
        return created
      } catch (error) {
        // Creation and membership are separate backend writes; reconcile if only
        // the list creation succeeded.
        void refresh()
        throw error
      }
    },
    [refresh],
  )

  const remove = useCallback(async (listId: string) => {
    await deleteLibraryList(listId)
    setLists((current) => current.filter((list) => list.id !== listId))
  }, [])

  return { lists, loading, error, refresh, create, remove }
}
