'use client'

import Link from 'next/link'

import type { GameSummary } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { gameStatusLabel } from '../utils/labels'
import { StatusBadge } from './status-badge'

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

  const card = (
    <div className={cn('group flex w-full flex-col gap-2', className)}>
      <div className="bg-muted relative aspect-3/4 overflow-hidden rounded-lg">
        {game.cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- external cover host; migrate to next/image + remotePatterns when known
          <img
            src={game.cover}
            alt={game.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {game.status !== 'RELEASED' ? (
          <div className="absolute top-2 left-2">
            <StatusBadge status={game.status} label={gameStatusLabel(dict, game.status)} />
          </div>
        ) : null}
      </div>
      <p className="truncate text-sm font-medium">{game.name}</p>
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
