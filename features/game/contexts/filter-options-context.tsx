/** Filter options already loaded by the explore controller and shared with the idle feed. */
'use client'

import { createContext, type ReactNode } from 'react'

import type { GameFilterOptions } from '@/lib/domain/models'

export const FilterOptionsContext = createContext<GameFilterOptions | null>(null)

export function FilterOptionsProvider({
  options,
  children,
}: {
  options: GameFilterOptions | null
  children: ReactNode
}) {
  return <FilterOptionsContext value={options}>{children}</FilterOptionsContext>
}
