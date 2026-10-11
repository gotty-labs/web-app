'use client'

import { Fragment, type MouseEvent } from 'react'
import { ChevronRightIcon } from 'lucide-react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  AdSlot,
  adPlacement,
  FEED_GAMES_PER_AD,
  MAX_FEED_ADS,
  useAdvertising,
  useCardAdViewport,
} from '@/features/advertising'
import type { GameSummary } from '@/lib/domain/models'
import { cn } from '@/lib/utils'

import { GameCard } from './game-card'

/**
 * A Netflix-style section: an interactive title + a looping horizontal carousel
 * of game cards (desktop arrows; touch-scroll on mobile). Clicking the title
 * fires `onSeeAll` (the flow decides: modal or full paginated screen).
 *
 * Without a `title` it renders just the row (the caller owns the heading). The feed
 * defaults (looping, in-row ads, cards opening in a new tab) can be turned off with
 * `loop`, `withAds` and `newTab`; `onGameClick` sees each card click (1-based
 * position is `index + 1`) before the card navigates.
 */
export function GameCarousel({
  title,
  games,
  onSeeAll,
  adLabel,
  withAds = true,
  loop = true,
  newTab = true,
  onGameClick,
  className,
}: {
  title?: string
  games: GameSummary[]
  onSeeAll?: () => void
  adLabel: string
  withAds?: boolean
  loop?: boolean
  newTab?: boolean
  onGameClick?: (game: GameSummary, index: number, event: MouseEvent<HTMLAnchorElement>) => void
  className?: string
}) {
  const advertising = useAdvertising()
  const canRenderCardAds = useCardAdViewport()
  let insertedAds = 0

  const row = (
    <Carousel opts={{ align: 'start', dragFree: true, loop }} className="w-full">
      <CarouselContent>
        {games.map((game, index) => {
          const insertAd =
            withAds &&
            advertising.enabled &&
            canRenderCardAds &&
            (index + 1) % FEED_GAMES_PER_AD === 0 &&
            insertedAds < MAX_FEED_ADS
          const adIndex = insertAd ? insertedAds++ : -1

          return (
            <Fragment key={game.id}>
              <CarouselItem className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-[12.5%]">
                <GameCard
                  game={game}
                  newTab={newTab}
                  onClick={onGameClick ? (event) => onGameClick(game, index, event) : undefined}
                />
              </CarouselItem>
              {insertAd ? (
                <CarouselItem className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-[12.5%]">
                  <AdSlot
                    key={`${title}-ad-${adIndex}`}
                    placement={adPlacement.feed}
                    label={adLabel}
                    className="aspect-3/4 rounded-lg border border-border/60 bg-muted/20 p-2"
                  />
                </CarouselItem>
              ) : null}
            </Fragment>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className="left-1 hidden bg-background/80 backdrop-blur-sm md:inline-flex" />
      <CarouselNext className="right-1 hidden bg-background/80 backdrop-blur-sm md:inline-flex" />
    </Carousel>
  )

  if (title === undefined) return <div className={className}>{row}</div>

  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {onSeeAll ? (
        <button
          type="button"
          onClick={onSeeAll}
          className="group flex w-fit items-center gap-1 font-pixel text-base font-semibold md:text-lg"
        >
          {title}
          <ChevronRightIcon className="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      ) : (
        <h2 className="font-pixel text-base font-semibold md:text-lg">{title}</h2>
      )}

      {row}
    </section>
  )
}
