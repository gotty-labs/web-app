'use client'

import { ChevronRightIcon } from 'lucide-react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { GameSummary } from '@/lib/domain/models'
import { cn } from '@/lib/utils'

import { GameCard } from './game-card'

/**
 * A Netflix-style section: an interactive title + a looping horizontal carousel
 * of game cards (desktop arrows; touch-scroll on mobile). Clicking the title
 * fires `onSeeAll` (the flow decides: modal or full paginated screen).
 */
export function GameCarousel({
  title,
  games,
  onSeeAll,
  className,
}: {
  title: string
  games: GameSummary[]
  onSeeAll?: () => void
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {onSeeAll ? (
        <button
          type="button"
          onClick={onSeeAll}
          className="group flex w-fit items-center gap-1 text-base font-semibold md:text-lg"
        >
          {title}
          <ChevronRightIcon className="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      ) : (
        <h2 className="text-base font-semibold md:text-lg">{title}</h2>
      )}

      <Carousel opts={{ align: 'start', dragFree: true, loop: true }} className="w-full">
        <CarouselContent>
          {games.map((game) => (
            <CarouselItem
              key={game.id}
              className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-[12.5%]"
            >
              <GameCard game={game} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 hidden bg-background/80 backdrop-blur-sm md:inline-flex" />
        <CarouselNext className="right-1 hidden bg-background/80 backdrop-blur-sm md:inline-flex" />
      </Carousel>
    </section>
  )
}
