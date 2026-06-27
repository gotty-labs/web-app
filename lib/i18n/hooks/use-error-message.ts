/** Returns an error translator bound to the active dictionary (`getErrorMessage`). */
'use client'

import { getErrorMessage } from '../errors'

import { useI18n } from './use-i18n'

export function useErrorMessage(): (error: unknown) => string {
  const { dictionary } = useI18n()
  return (error: unknown) => getErrorMessage(error, dictionary)
}
