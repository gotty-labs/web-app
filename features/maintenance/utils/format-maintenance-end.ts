import { DateTime } from 'luxon'

import type { Locale } from '@/lib/i18n'

import {
  MAINTENANCE_DATABASE_START_HOUR_UTC,
  MAINTENANCE_DATABASE_START_MINUTE_UTC,
  MAINTENANCE_RECOVERY_BUFFER_MINUTES,
} from '../config/maintenance'

function formatUtcOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return 'UTC'

  const sign = offsetMinutes > 0 ? '+' : '-'
  const absoluteMinutes = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteMinutes / 60)
  const minutes = absoluteMinutes % 60
  const minuteSuffix = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`

  return `UTC${sign}${hours}${minuteSuffix}`
}

export function formatMaintenanceEnd(locale: Locale, now = DateTime.utc()): string {
  const expectedReturn = now
    .toUTC()
    .startOf('day')
    .set({
      hour: MAINTENANCE_DATABASE_START_HOUR_UTC,
      minute: MAINTENANCE_DATABASE_START_MINUTE_UTC,
    })
    .plus({ minutes: MAINTENANCE_RECOVERY_BUFFER_MINUTES })
    .toLocal()
    .setLocale(locale)

  const localTime = expectedReturn.toLocaleString(DateTime.TIME_SIMPLE)
  return `${localTime} (${formatUtcOffset(expectedReturn.offset)})`
}
