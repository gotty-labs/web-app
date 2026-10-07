/**
 * Compact bar pinned to the top of the viewport once the hero's library actions scroll
 * away: cover thumbnail, name, score, and the actions passed as children. Portaled to
 * `body` because the hero is its own stacking context (`isolate`), which would trap a
 * fixed child under later positioned content. It reuses the content column geometry
 * so its edges line up with the sections below. It leads with the Gotty mark so the way
 * back into the app stays one click away while scrolling. Mount it only on the client.
 */
'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { TrophyIcon } from 'lucide-react'

import { AppImage } from '@/components/app-image'
import { BrandMark } from '@/components/brand-mark'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { DETAIL_COLUMN_CLASS, DETAIL_GRID_CLASS } from '../config/detail-layout'

export type StickyBarGame = {
  name: string
  cover: string
  /** Formatted 0 to 5 score; omitted when the game has no rating summary. */
  rating?: string
}

export function GameLibraryStickyBar({
  game,
  children,
}: {
  game: StickyBarGame
  children: ReactNode
}) {
  const t = useDictionary().app.detail

  return createPortal(
    <div className="fixed inset-x-0 top-0 z-40 border-b bg-background/90 backdrop-blur-md duration-200 animate-in fade-in slide-in-from-top-2">
      <div className={DETAIL_GRID_CLASS}>
        <div className={cn(DETAIL_COLUMN_CLASS, 'flex h-14 items-center gap-3')}>
          <Link href="/home" aria-label={t.backToHome} className="shrink-0">
            <BrandMark wrapperClassName="h-7 w-10" sizes="40px" />
          </Link>
          <div className="relative aspect-3/4 w-7 shrink-0 overflow-hidden rounded-sm">
            <AppImage
              src={game.cover}
              alt=""
              fill
              sizes="28px"
              wrapperClassName="absolute inset-0"
              className="object-cover"
            />
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{game.name}</p>
          {game.rating ? (
            <span className="hidden shrink-0 items-center gap-1 text-sm text-muted-foreground sm:flex">
              <TrophyIcon aria-hidden className="size-3.5" />
              {game.rating}
            </span>
          ) : null}
          <div className="flex shrink-0 items-center gap-2">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
