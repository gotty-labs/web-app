/** Accesses the shared console visibility sheet state. */
'use client'

import { useContext } from 'react'

import { ConsoleVisibilityContext } from '@/contexts/console-visibility-provider'

export function useConsoleVisibility() {
  const context = useContext(ConsoleVisibilityContext)
  if (!context) {
    throw new Error('useConsoleVisibility must be used within a <ConsoleVisibilityProvider>')
  }
  return context
}
