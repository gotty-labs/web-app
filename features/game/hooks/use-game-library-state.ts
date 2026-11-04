'use client'

import { use } from 'react'

import {
  GameLibraryStateContext,
  type GameLibraryStateValue,
} from '../contexts/game-library-state-provider'

/** The detail's shared library state; must be rendered under `GameLibraryStateProvider`. */
export function useGameLibraryState(): GameLibraryStateValue {
  const value = use(GameLibraryStateContext)
  if (!value) throw new Error('useGameLibraryState must be used within GameLibraryStateProvider')
  return value
}
