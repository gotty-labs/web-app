/**
 * Story date (`publishedAt`, the story's first publication): "Just now" under a minute
 * (or a future date from clock skew), "N min ago" under an hour, "N h ago" under a
 * day, then a short localized date ("Oct 12" / "12 oct") with the year when it isn't
 * the current one. Luxon only (project convention).
 */
import { DateTime } from 'luxon'

import type { Locale } from '@/lib/i18n'

export interface NewsDateCopy {
  justNow: string
  minutesAgo: string
  hoursAgo: string
}

export function formatNewsDate(iso: string, locale: Locale, copy: NewsDateCopy): string {
  const now = DateTime.now()
  const date = DateTime.fromISO(iso)
  if (!date.isValid) return ''

  const minutes = Math.floor(now.diff(date, 'minutes').minutes)
  if (minutes < 1) return copy.justNow
  if (minutes < 60) return copy.minutesAgo.replace('{count}', String(minutes))
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return copy.hoursAgo.replace('{count}', String(hours))

  const local = date.setZone(now.zone).setLocale(locale)
  return local.toLocaleString(
    local.year === now.year
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'short', year: 'numeric' },
  )
}
