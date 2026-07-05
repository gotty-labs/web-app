'use client'

import Image from 'next/image'
import Link from 'next/link'

import type { GameSummary } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { gameGenreLabel, gameStatusLabel } from '../utils/labels'
import { RatingBadge } from './rating-badge'
import { StatusBadge } from './status-badge'

/** Dark, blurred chip so overlays stay readable over any (often light) cover. */
const OVERLAY_CHIP = 'border-transparent bg-black/70 text-white backdrop-blur-sm'

/**
 * Netflix-style game card (cover + name, status badge overlay for non-released).
 * Used in the authed app (feed/search/library) → client component, reads labels
 * from the dictionary. Links to `href` (defaults to `/games/<slug>` when present).
 */
export function GameCard({
  game,
  href,
  className,
}: {
  game: GameSummary
  href?: string
  className?: string
}) {
  const dict = useDictionary()
  const target = href ?? (game.slug ? `/games/${game.slug}` : undefined)

  const showStatus = game.status !== 'RELEASED'
  const showRating = game.rating?.value != null
  const year = game.releaseDate?.slice(0, 4)
  const genre = game.genres[0] ? gameGenreLabel(dict, game.genres[0]) : undefined
  const subtitle = [year, genre].filter(Boolean).join(' · ')

  const card = (
    <div className={cn('group flex w-full flex-col gap-2', className)}>
      <div className="bg-muted relative aspect-3/4 overflow-hidden rounded-lg">
        {game.cover ? (
          <Image
            src={game.cover}
            alt={game.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {(showStatus || showRating) && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
        )}
        {showStatus ? (
          <div className="absolute top-2 left-2">
            <StatusBadge
              status={game.status}
              label={gameStatusLabel(dict, game.status)}
              className={OVERLAY_CHIP}
            />
          </div>
        ) : null}
        {showRating ? (
          <div className="absolute top-2 right-2">
            <RatingBadge value={game.rating?.value} className={OVERLAY_CHIP} />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col">
        <p className="truncate text-sm font-medium">{game.name}</p>
        {subtitle ? <p className="text-muted-foreground truncate text-xs">{subtitle}</p> : null}
      </div>
    </div>
  )

  return target ? (
    <Link href={target} className="block">
      {card}
    </Link>
  ) : (
    card
  )
}
