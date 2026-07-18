'use client'

import { SquarePenIcon } from 'lucide-react'
import Link from 'next/link'

import { AppImage } from '@/components/app-image'
import { Button } from '@/components/ui/button'
import type { GameLibrary } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { gameProgressStateLabel } from '../utils/labels'
import { formatPlaytime } from '../utils/format'
import { ProgressBadge } from './progress-badge'

/**
 * Library card: cover + name + the user's progress-state badge, plus the logged
 * play time under the name when there is one (the datum the user recorded via the
 * progress modal — otherwise it was write-only). The card links to the game
 * detail; the overlaid pen button fires `onUpdateProgress` (opens the progress
 * modal in the flow). The pen is a SIBLING of the link, never nested in it (no
 * interactive-inside-anchor). `updateLabel` is the button's accessible name.
 */
export function LibraryGameCard({
  game,
  href,
  onUpdateProgress,
  updateLabel,
  className,
}: {
  game: GameLibrary
  href?: string
  onUpdateProgress?: () => void
  updateLabel?: string
  className?: string
}) {
  const dict = useDictionary()
  const target = href ?? (game.slug ? `/games/${game.slug}` : undefined)

  const inner = (
    <div className="flex flex-col gap-2">
      <div className="bg-muted relative aspect-3/4 overflow-hidden rounded-lg">
        {game.cover ? (
          <AppImage
            src={game.cover}
            alt={game.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
            wrapperClassName="absolute inset-0"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute top-2 left-2">
          <ProgressBadge
            state={game.progress.state}
            label={gameProgressStateLabel(dict, game.progress.state)}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <p className="truncate text-sm font-medium">{game.name}</p>
        {game.progress.duration ? (
          <p className="text-muted-foreground truncate text-xs">
            {formatPlaytime(game.progress.duration)}
          </p>
        ) : null}
      </div>
    </div>
  )

  return (
    <div className={cn('group relative flex w-full flex-col', className)}>
      {target ? (
        <Link href={target} target="_blank" rel="noopener noreferrer" className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
      {onUpdateProgress ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label={updateLabel}
          onClick={onUpdateProgress}
          className="absolute top-2 right-2"
        >
          <SquarePenIcon />
        </Button>
      ) : null}
    </div>
  )
}
