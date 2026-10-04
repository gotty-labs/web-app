/**
 * The feed hero's callouts — per pinned section, a dot on its anchor, an S-curve, and a
 * chip beside the console that opens the section (the apps' `FeedHeroCalloutView`).
 * Dots and curves are decorative (`aria-hidden`); chips are real buttons labeled with
 * the section title, and take clicks and focus only once at least half visible.
 */
'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { GameFeedSection } from '@/lib/domain/models'
import { cn } from '@/lib/utils'

import { feedSectionIcon } from '../config/feed-section-icons'
import type { HeroCallout, HeroPin, Point } from '../utils/hero-callouts'

const CURVE_STROKE_WIDTH = 1.5

/**
 * An S-shaped connector that leaves the anchor and reaches the chip horizontally, like
 * the links of a node editor: a cubic with control points (midX, anchorY), (midX, chipY).
 */
function curvePath(start: Point, end: Point): string {
  const middleX = (start.x + end.x) / 2
  return `M ${start.x} ${start.y} C ${middleX} ${start.y}, ${middleX} ${end.y}, ${end.x} ${end.y}`
}

/** Centers an absolutely positioned element on `point`, without layout work per frame. */
function centeredAt(point: Point) {
  return { transform: `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)` }
}

export function FeedHeroCallouts({
  callouts,
  topInset,
  onOpen,
}: {
  callouts: readonly HeroCallout<GameFeedSection>[]
  /** The chips' area starts this far below the hero's top (under the header). */
  topInset: number
  onOpen: (pin: HeroPin<GameFeedSection>) => void
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ top: topInset }}>
      <svg aria-hidden className="absolute inset-0 size-full overflow-visible">
        {callouts.map((callout) => (
          <path
            key={callout.pin.id}
            d={curvePath(callout.anchorPoint, callout.chipPoint)}
            opacity={callout.visibility}
            strokeWidth={CURVE_STROKE_WIDTH}
            strokeLinecap="round"
            className="fill-none stroke-primary-foreground"
          />
        ))}
      </svg>

      {callouts.map((callout) => (
        <span
          key={callout.pin.id}
          aria-hidden
          className="absolute top-0 left-0 size-2 rounded-full bg-primary-foreground"
          style={{ ...centeredAt(callout.anchorPoint), opacity: callout.visibility }}
        />
      ))}

      {callouts.map((callout) => {
        const section = callout.pin.value
        const Icon = feedSectionIcon(section.section)
        return (
          <Tooltip key={callout.pin.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-testid={`feed.hero.pin.${section.section}`}
                aria-label={section.title}
                aria-hidden={!callout.interactive}
                tabIndex={callout.interactive ? 0 : -1}
                onClick={() => onOpen(callout.pin)}
                className={cn(
                  'group absolute top-0 left-0 grid size-11 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  callout.interactive && 'pointer-events-auto cursor-pointer',
                )}
                style={{ ...centeredAt(callout.chipPoint), opacity: callout.visibility }}
              >
                <span className="grid size-9 place-items-center rounded-full border-2 border-primary-foreground bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110 group-active:scale-95 motion-reduce:transition-none">
                  <Icon aria-hidden className="size-4" />
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{section.title}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
