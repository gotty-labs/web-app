'use client'

import { CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import type { MouseEventHandler } from 'react'

import { AppImage } from '@/components/app-image'
import { Badge } from '@/components/ui/badge'
import type { GameStatus } from '@/lib/domain/enums'
import type { GameSummary } from '@/lib/domain/models'
import { useDictionary, useLocale } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { getGameCover } from '../config/images'
import { gameGenreLabel, gameStatusLabel } from '../utils/labels'
import { formatReleaseChip, isFutureDate } from '../utils/format'
import { gamePath } from '../utils/paths'
import { RatingBadge } from './rating-badge'
import { StatusBadge } from './status-badge'

/** Dark, blurred chip so overlays stay readable over any (often light) cover. */
const OVERLAY_CHIP = 'border-transparent bg-black/70 text-white backdrop-blur-sm'

/** Statuses worth a warning chip — the game may never be playable. */
const WARNING_STATUSES: GameStatus[] = ['CANCELLED', 'DELISTED']
/** Pre-release states that genuinely inform (unlike RELEASED/UNKNOWN = noise). */
const INFORMATIVE_STATUSES: GameStatus[] = ['ALPHA', 'BETA', 'EARLY_ACCESS', 'RUMORED']

/**
 * Netflix-style game card (cover + name + one overlay chip, at most). The chip
 * slot is prioritized by usefulness to the user:
 *   1. CANCELLED/DELISTED → destructive status (a real warning),
 *   2. a FUTURE release date → localized date chip (the answer to "when?", which
 *      is what matters in upcoming rows — never a "Unknown" status),
 *   3. ALPHA/BETA/EARLY_ACCESS/RUMORED → informative status,
 *   4. RELEASED/UNKNOWN → nothing (both are noise on a card).
 * Used in the authed app (feed/search/library) → client component, reads labels
 * from the dictionary. Links to `href` (defaults to the locale-specific public
 * game URL when a slug is present) — in a new tab by default (the app keeps its
 * state), or in the same tab with `newTab={false}` (e.g. related games on the
 * public detail). `onClick` runs before the link navigates; `preventDefault()` in
 * it cancels the navigation.
 */
export function GameCard({
  game,
  href,
  newTab = true,
  onClick,
  className,
}: {
  game: GameSummary
  href?: string
  newTab?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
  className?: string
}) {
  const dict = useDictionary()
  const locale = useLocale()
  const target = href ?? (game.slug ? gamePath(game.slug, locale) : undefined)

  const showWarning = WARNING_STATUSES.includes(game.status)
  const dateChip =
    !showWarning && game.releaseDate && isFutureDate(game.releaseDate)
      ? formatReleaseChip(game.releaseDate, locale)
      : null
  const showStatus = !showWarning && dateChip === null && INFORMATIVE_STATUSES.includes(game.status)

  const showRating = game.rating?.value != null
  const hasOverlay = showWarning || dateChip !== null || showStatus || showRating

  // The date chip already answers "when" — repeating the year below is noise.
  const year = dateChip !== null ? undefined : game.releaseDate?.slice(0, 4)
  const genre = game.genres[0] ? gameGenreLabel(dict, game.genres[0]) : undefined
  const subtitle = [year, genre].filter(Boolean).join(' · ')

  const card = (
    <div className={cn('group flex w-full flex-col gap-2', className)}>
      <div className="bg-muted relative aspect-3/4 overflow-hidden rounded-lg">
        <AppImage
          src={getGameCover(game.cover)}
          alt={game.name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
          wrapperClassName="absolute inset-0"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasOverlay && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
        )}
        {(showWarning || showStatus) && (
          <div className="absolute top-2 left-2">
            <StatusBadge
              status={game.status}
              label={gameStatusLabel(dict, game.status)}
              className={OVERLAY_CHIP}
            />
          </div>
        )}
        {dateChip !== null && (
          <div className="absolute top-2 left-2">
            <Badge className={OVERLAY_CHIP}>
              <CalendarIcon />
              {dateChip}
            </Badge>
          </div>
        )}
        {showRating ? (
          <div className="absolute top-2 right-2">
            <RatingBadge value={game.rating?.value} locale={locale} className={OVERLAY_CHIP} />
          </div>
        ) : null}
        {/* Keyboard focus ring drawn INSIDE the cover: carousels clip anything outside. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg opacity-0 ring-2 ring-ring ring-inset group-focus-visible/link:opacity-100"
        />
      </div>
      <div className="flex flex-col">
        <p className="truncate text-sm font-medium">{game.name}</p>
        {subtitle ? <p className="text-muted-foreground truncate text-xs">{subtitle}</p> : null}
      </div>
    </div>
  )

  return target ? (
    <Link
      href={target}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      prefetch={false}
      onClick={onClick}
      className="group/link block outline-none"
    >
      {card}
    </Link>
  ) : (
    card
  )
}
