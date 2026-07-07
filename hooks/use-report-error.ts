/**
 * Report an error to the app-wide error modal (QA Chunk 0).
 *
 * Returns `report(error, { silent })`: maps the error to copy with `getErrorMessage`
 * (respecting `internalCode`) and shows the global modal — unless the call is
 * `silent`, in which case the caller handles the error itself.
 */
'use client'

import { useCallback, useContext } from 'react'

import { ErrorContext } from '@/contexts/error-provider'
import { getErrorMessage } from '@/lib/i18n'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

export function useReportError(): (error: unknown, opts?: { silent?: boolean }) => void {
  const show = useContext(ErrorContext)
  const dict = useDictionary()

  return useCallback(
    (error, opts) => {
      if (opts?.silent) return
      show?.(getErrorMessage(error, dict))
    },
    [show, dict],
  )
}
