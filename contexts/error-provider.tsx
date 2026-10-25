/**
 * App-wide error surface (QA Chunk 0). The backend returns errors on `error` +
 * `internalCode` (the numeric code wins); instead of ad-hoc callouts/toasts per
 * flow, any component calls `useReportError()` and a SINGLE global modal shows the
 * mapped copy (via `getErrorMessage`, which already branches on `internalCode`).
 *
 * Opt-out: a screen/flow that wants to handle an error itself simply doesn't call
 * `report()` (it catches and renders its own UX), or passes `{ silent: true }` at the
 * call site for the conditional case. For now everything is generic per the product
 * decision.
 *
 * Must sit INSIDE `I18nProvider` (the modal + reporter read the dictionary).
 */
'use client'

import { createContext, useCallback, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

/** Shows an already-mapped message in the global modal. Null outside a provider. */
export const ErrorContext = createContext<((message: string) => void) | null>(null)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const dict = useDictionary()
  const [message, setMessage] = useState<string | null>(null)

  const show = useCallback((next: string) => setMessage(next), [])

  return (
    <ErrorContext value={show}>
      {children}
      <Dialog
        open={message !== null}
        onOpenChange={(open) => {
          if (!open) setMessage(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.app.errorModal.title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setMessage(null)}>{dict.app.errorModal.dismiss}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorContext>
  )
}
