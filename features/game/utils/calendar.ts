/**
 * Calendar helpers for release dates: build an all-day event the user can add to
 * Apple Calendar (a downloaded `.ics` file) or Google Calendar (a prefilled URL).
 *
 * Dates come from the backend as raw ISO strings; per project convention we parse
 * and format them with Luxon (NEVER the native `Date`). Events are all-day, so we
 * emit `YYYYMMDD` values (DTEND is the day after DTSTART, the iCalendar convention
 * for a single all-day event).
 */
import { DateTime } from 'luxon'

export type CalendarEvent = {
  title: string
  /** ISO release date. */
  date: string
  details?: string
}

/** `YYYYMMDD` for an ISO date; empty when the date is absent/invalid. */
function toAllDayStamp(iso: string): string | null {
  const date = DateTime.fromISO(iso)
  return date.isValid ? date.toFormat('yyyyMMdd') : null
}

/** Google Calendar "template" URL for an all-day event (opens the compose screen). */
export function buildGoogleCalendarUrl(event: CalendarEvent): string | null {
  const start = toAllDayStamp(event.date)
  if (!start) return null
  const end = DateTime.fromISO(event.date).plus({ days: 1 }).toFormat('yyyyMMdd')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
  })
  if (event.details) params.set('details', event.details)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** A minimal, spec-valid iCalendar (`.ics`) document for a single all-day event. */
export function buildIcs(event: CalendarEvent): string | null {
  const start = toAllDayStamp(event.date)
  if (!start) return null
  const end = DateTime.fromISO(event.date).plus({ days: 1 }).toFormat('yyyyMMdd')
  const stamp = DateTime.utc().toFormat("yyyyMMdd'T'HHmmss'Z'")
  const uid = `${start}-${Math.random().toString(36).slice(2)}@justgame`
  // Fold nothing (short lines) and escape commas/semicolons per RFC 5545.
  const esc = (text: string) => text.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JustGame//Release//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${esc(event.title)}`,
    event.details ? `DESCRIPTION:${esc(event.details)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

/** Trigger a browser download of an `.ics` file (client-only). */
export function downloadIcs(event: CalendarEvent, filename = 'release.ics'): void {
  const ics = buildIcs(event)
  if (!ics || typeof document === 'undefined') return
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/** True on Apple platforms (Mac/iOS) — used to lead with Apple Calendar. */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = `${navigator.platform ?? ''} ${navigator.userAgent ?? ''}`
  return /Mac|iPhone|iPad|iPod/i.test(ua)
}
