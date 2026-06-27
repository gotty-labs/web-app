/** Hooks to read the active locale/dictionary from `I18nProvider`. */
'use client'

import { useContext } from 'react'

import { I18nContext, type I18nContextValue } from '../contexts/i18n-provider'
import type { Dictionary } from '../dictionary'
import type { Locale } from '../locales'

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('i18n hooks must be used within an <I18nProvider>')
  }
  return ctx
}

export function useLocale(): Locale {
  return useI18n().locale
}

export function useDictionary(): Dictionary {
  return useI18n().dictionary
}
