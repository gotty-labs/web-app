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

/**
 * Parse a release date leniently: ISO first (the contract), then a numeric epoch in
 * millis or seconds as a fallback, so a non-ISO backend value still lands the event on
 * the real date instead of failing to today.
 */
function parseEventDate(value: string): DateTime | null {
  const iso = DateTime.fromISO(value)
  if (iso.isValid) return iso
  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    const asMillis = DateTime.fromMillis(numeric > 1e12 ? numeric : numeric * 1000)
    if (asMillis.isValid) return asMillis
  }
  return null
}

/** Google Calendar "template" URL for an all-day event (opens the compose screen). */
export function buildGoogleCalendarUrl(event: CalendarEvent): string | null {
  const date = parseEventDate(event.date)
  if (!date) return null
  const start = date.toFormat('yyyyMMdd')
  const end = date.plus({ days: 1 }).toFormat('yyyyMMdd')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
  })
  if (event.details) params.set('details', event.details)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Fold a content line to <=75 octets per RFC 5545 (continuation lines start with a space). */
function foldLine(line: string): string {
  if (line.length <= 74) return line
  const chunks: string[] = []
  let rest = line
  chunks.push(rest.slice(0, 74))
  rest = rest.slice(74)
  while (rest.length > 0) {
    chunks.push(` ${rest.slice(0, 73)}`)
    rest = rest.slice(73)
  }
  return chunks.join('\r\n')
}

/** A minimal, spec-valid iCalendar (`.ics`) document for a single all-day event. */
export function buildIcs(event: CalendarEvent): string | null {
  const date = parseEventDate(event.date)
  if (!date) return null
  const start = date.toFormat('yyyyMMdd')
  const end = date.plus({ days: 1 }).toFormat('yyyyMMdd')
  const stamp = DateTime.utc().toFormat("yyyyMMdd'T'HHmmss'Z'")
  const uid = `${start}-${Math.random().toString(36).slice(2)}@gotty`
  const esc = (text: string) => text.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//Gotty//Release//EN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      foldLine(`SUMMARY:${esc(event.title)}`),
      event.details ? foldLine(`DESCRIPTION:${esc(event.details)}`) : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n') + '\r\n'
  )
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
