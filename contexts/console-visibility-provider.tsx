/** Shared opener and saved-state bridge for the console visibility sheet. */
'use client'

import { createContext, useState, type ReactNode } from 'react'

import { ConsoleVisibilityModal } from '@/features/profile/components/console-visibility-modal'

export interface ConsoleVisibilityContextValue {
  openConsoleVisibility: () => void
  visibilityOverride: boolean | null
  visibilityRevision: number
}

export const ConsoleVisibilityContext = createContext<ConsoleVisibilityContextValue | null>(null)

export function ConsoleVisibilityProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [visibilityOverride, setVisibilityOverride] = useState<boolean | null>(null)
  const [visibilityRevision, setVisibilityRevision] = useState(0)

  function handleSaved(hasExcludedConsoles: boolean) {
    setVisibilityOverride(hasExcludedConsoles)
    setVisibilityRevision((revision) => revision + 1)
  }

  return (
    <ConsoleVisibilityContext
      value={{
        openConsoleVisibility: () => setOpen(true),
        visibilityOverride,
        visibilityRevision,
      }}
    >
      {children}
      {open && <ConsoleVisibilityModal onClose={() => setOpen(false)} onSaved={handleSaved} />}
    </ConsoleVisibilityContext>
  )
}
