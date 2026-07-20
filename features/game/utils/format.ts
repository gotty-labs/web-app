/**
 * Pure presentation formatters for game data (dates come from the backend as raw
 * ISO strings — parsing/formatting is an edge concern, see `models/common.ts`).
 * Built on Luxon (project convention: NEVER the native `Date`), locale-aware via
 * `setLocale`, so they work in server and client components alike.
 */
import { DateTime, Duration } from 'luxon'

import type { Locale } from '@/lib/i18n'

/** Safe ISO → DateTime; null for absent/invalid values (never throws on bad data). */
export function parseIsoDate(iso?: string): DateTime | null {
  if (!iso) return null
  const date = DateTime.fromISO(iso)
  return date.isValid ? date : null
}

/** True when the date exists and is in the future. */
export function isFutureDate(iso?: string): boolean {
  const date = parseIsoDate(iso)
  return date !== null && date > DateTime.now()
}

/**
 * Compact release date for card chips: same year → "Dec 12" / "12 dic";
 * later years → "Dec 2026" / "dic 2026" (the month matters less than the year).
 */
export function formatReleaseChip(iso: string, locale: Locale): string {
  const date = parseIsoDate(iso)
  if (!date) return ''
  const sameYear = date.year === DateTime.now().year
  return date
    .setLocale(locale)
    .toLocaleString(
      sameYear ? { day: 'numeric', month: 'short' } : { month: 'short', year: 'numeric' },
    )
}

/** Full date for detail views, e.g. "December 12, 2026" / "12 de diciembre de 2026". */
export function formatFullDate(iso: string, locale: Locale): string {
  const date = parseIsoDate(iso)
  return date ? date.setLocale(locale).toLocaleString(DateTime.DATE_FULL) : ''
}

/** Medium date for dense lists, e.g. "Dec 12, 2026" / "12 dic 2026". */
export function formatMediumDate(iso: string, locale: Locale): string {
  const date = parseIsoDate(iso)
  return date ? date.setLocale(locale).toLocaleString(DateTime.DATE_MED) : ''
}

/** Release year only (for the header) — empty when the date is absent/invalid. */
export function formatYear(iso?: string): string {
  const date = parseIsoDate(iso)
  return date ? String(date.year) : ''
}

/** Play time from MINUTES (the library's `progress.duration`): "45 min", "8 h", "8 h 30 min". */
export function formatPlaytime(minutes: number): string {
  const { hours = 0, minutes: rest = 0 } = Duration.fromObject({ minutes })
    .shiftTo('hours', 'minutes')
    .toObject()
  if (hours < 1) return `${rest} min`
  return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`
}

/** Time-to-beat from SECONDS (HowLongToBeat-style): rounded hours, "31 h". */
export function formatTimeToBeat(seconds: number): string {
  const duration = Duration.fromObject({ seconds })
  const hours = Math.round(duration.as('hours'))
  return hours < 1 ? formatPlaytime(Math.round(duration.as('minutes'))) : `${hours} h`
}

/** Time-to-beat SECONDS → hours as a number (for chart/bar ratios). */
export function timeToBeatHours(seconds: number): number {
  return Duration.fromObject({ seconds }).as('hours')
}
