/**
 * Five trophies filled in proportion to a 0 to 5 score: a fractional score partially
 * fills one trophy (4.32 → four full, the fifth at 32%). Each trophy is a muted filled
 * track with a foreground copy clipped horizontally on top. Decorative: the parent
 * carries the accessible phrase. Server-safe.
 */
import { TrophyIcon } from 'lucide-react'

import { RATING_MAX_VALUE } from '@/lib/domain/models'

/**
 * Horizontal share of lucide's 24px trophy box covered by ink: the handles reach
 * x = 2 and x = 22, plus half of the 2px stroke on each side → x = 1 to 23. Clipping
 * against the ink (not the box) makes 0.5 cut the glyph exactly in half.
 */
const INK_LEADING_INSET = 1 / 24
const INK_WIDTH = 22 / 24

/** Right-side `inset()` that leaves `fill` (0 to 1) of the trophy ink visible. */
function clipRightPercent(fill: number): number {
  if (fill <= 0) return 100
  if (fill >= 1) return 0
  return 100 - (INK_LEADING_INSET + INK_WIDTH * fill) * 100
}

export function RatingTrophies({ value }: { value: number }) {
  return (
    <span aria-hidden className="flex items-center gap-0.5">
      {Array.from({ length: RATING_MAX_VALUE }, (_, index) => {
        const fill = Math.min(Math.max(value - index, 0), 1)
        return (
          <span key={index} className="relative flex">
            <TrophyIcon className="size-3.5 fill-current text-muted" />
            <TrophyIcon
              className="absolute inset-0 size-3.5 fill-current text-foreground"
              style={{ clipPath: `inset(0 ${clipRightPercent(fill)}% 0 0)` }}
            />
          </span>
        )
      })}
    </span>
  )
}
