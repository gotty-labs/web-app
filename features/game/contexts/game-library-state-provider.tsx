/**
 * The member's library state for the game on screen, shared by the two pieces of the
 * detail that read and write it: the library actions under the title and the
 * achievements block further down. One `GET /game/public/:slug/library` per member
 * and game (never for visitors or guests); writes patch it in place so both pieces
 * stay in sync (a mark saves the game, removing it clears the marks).
 *
 *  - `session`   → session still hydrating.
 *  - `anonymous` → visitor or guest: no personal data.
 *  - `loading`   → member, state in flight.
 *  - `ready`     → member with `state`.
 *  - `error`     → member whose state could not be read (no actions, no progress).
 *
 * State is tagged with the member + slug it belongs to, so a sign-out or a different
 * member never sees a previous answer.
 */
'use client'

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useSession } from '@/features/auth'
import type { GameLibraryState } from '@/lib/domain/models'

import { getGameLibraryState } from '../services/library'

export type GameLibraryPhase = 'session' | 'anonymous' | 'loading' | 'ready' | 'error'

export interface GameLibraryStateValue {
  phase: GameLibraryPhase
  state: GameLibraryState | null
  /** Applies a change to the loaded state (no-op until it is `ready`). */
  update: (change: (state: GameLibraryState) => GameLibraryState) => void
  /** Replaces the state after a reconciliation read. */
  replace: (state: GameLibraryState) => void
}

export const GameLibraryStateContext = createContext<GameLibraryStateValue | null>(null)

type Loaded = { key: string; state: GameLibraryState | null }

export function GameLibraryStateProvider({
  slug,
  children,
}: {
  slug: string
  children: ReactNode
}) {
  const { status, user } = useSession()
  const key = status === 'authenticated' && user ? `${user.id}:${slug}` : null
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (!key) return
    let active = true
    getGameLibraryState(slug)
      .then((state) => {
        if (active) setLoaded({ key, state })
      })
      .catch(() => {
        // An unknown state hides the actions and the personal progress (as today).
        if (active) setLoaded({ key, state: null })
      })
    return () => {
      active = false
    }
  }, [key, slug])

  const current = key && loaded?.key === key ? loaded : null
  const phase: GameLibraryPhase =
    status === 'loading'
      ? 'session'
      : !key
        ? 'anonymous'
        : !current
          ? 'loading'
          : current.state
            ? 'ready'
            : 'error'

  const update = useCallback(
    (change: (state: GameLibraryState) => GameLibraryState) =>
      setLoaded((previous) =>
        previous?.key === key && previous.state
          ? { key: previous.key, state: change(previous.state) }
          : previous,
      ),
    [key],
  )
  const replace = useCallback(
    (state: GameLibraryState) => {
      if (key) setLoaded({ key, state })
    },
    [key],
  )

  const value = useMemo<GameLibraryStateValue>(
    () => ({ phase, state: current?.state ?? null, update, replace }),
    [phase, current, update, replace],
  )

  return <GameLibraryStateContext value={value}>{children}</GameLibraryStateContext>
}
