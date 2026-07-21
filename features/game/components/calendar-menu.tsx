/**
 * Shared "add to calendar" control: a calendar-plus button that opens a menu with
 * Apple Calendar (downloads an `.ics`) and Google Calendar (opens a prefilled URL).
 * Reused by release dates and DLC/expansion releases.
 */
'use client'

import { CalendarPlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { buildGoogleCalendarUrl, downloadIcs, type CalendarEvent } from '../utils/calendar'

export type CalendarLabels = {
  addToCalendar: string
  appleCalendar: string
  googleCalendar: string
}

export function CalendarMenu({ event, labels }: { event: CalendarEvent; labels: CalendarLabels }) {
  const googleUrl = buildGoogleCalendarUrl(event)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={labels.addToCalendar}>
          <CalendarPlusIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => downloadIcs(event, 'release.ics')}>
          {labels.appleCalendar}
        </DropdownMenuItem>
        {googleUrl ? (
          <DropdownMenuItem
            onSelect={() => window.open(googleUrl, '_blank', 'noopener,noreferrer')}
          >
            {labels.googleCalendar}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
