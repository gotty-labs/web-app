/**
 * Shares the explore controller's sticky `FilterHeader` element with the idle feed, so
 * the feed sheet can measure it (the sheet stops rising at its bottom edge) and let the
 * hero show through it while the sheet is still below.
 */
'use client'

import { createContext, type ReactNode, type RefObject } from 'react'

export const FilterHeaderContext = createContext<RefObject<HTMLElement | null> | null>(null)

export function FilterHeaderProvider({
  headerRef,
  children,
}: {
  headerRef: RefObject<HTMLElement | null>
  children: ReactNode
}) {
  return <FilterHeaderContext value={headerRef}>{children}</FilterHeaderContext>
}
