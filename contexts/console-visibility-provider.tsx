/**
 * Shared opener and state for the console visibility sheet: how many consoles the feed
 * is limited to (the count badges on the header button and the sidebar item, like the
 * apps' feed header) and a revision the feed reloads on after a save.
 */
'use client'

import { createContext, useEffect, useState, type ReactNode } from 'react'

import { appPromotionStore } from '@/features/app-promotion'
import { getFilterOptions } from '@/features/game/services/catalog'
import { ConsoleVisibilityModal } from '@/features/profile/components/console-visibility-modal'
import type { GameFilterOptions } from '@/lib/domain/models'

export interface ConsoleVisibilityContextValue {
  openConsoleVisibility: () => void
  /** Consoles the feed is limited to; `0` while no console is hidden (no limit). */
  appliedConsoleCount: number
  visibilityRevision: number
}

export const ConsoleVisibilityContext = createContext<ConsoleVisibilityContextValue | null>(null)

function countVisibleConsoles(consoles: GameFilterOptions['consoles']): number {
  if (!consoles.some((gameConsole) => gameConsole.excluded)) return 0
  return consoles.filter((gameConsole) => !gameConsole.excluded).length
}

export function ConsoleVisibilityProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loadedCount, setLoadedCount] = useState<number | null>(null)
  const [savedCount, setSavedCount] = useState<number | null>(null)
  const [visibilityRevision, setVisibilityRevision] = useState(0)

  // Only for the badge: a failed load just shows none until the next save.
  useEffect(() => {
    let active = true
    getFilterOptions()
      .then((options) => {
        if (active) setLoadedCount(countVisibleConsoles(options.consoles))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  function handleSaved(visibleCount: number) {
    setSavedCount(visibleCount)
    setVisibilityRevision((revision) => revision + 1)
  }

  function openConsoleVisibility() {
    if (!appPromotionStore.request(() => setOpen(true))) setOpen(true)
  }

  return (
    <ConsoleVisibilityContext
      value={{
        openConsoleVisibility,
        appliedConsoleCount: savedCount ?? loadedCount ?? 0,
        visibilityRevision,
      }}
    >
      {children}
      {open && <ConsoleVisibilityModal onClose={() => setOpen(false)} onSaved={handleSaved} />}
    </ConsoleVisibilityContext>
  )
}
