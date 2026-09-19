/**
 * Text clamped to a couple of lines with a show more / show less toggle. Whether the
 * toggle is needed is measured once on mount via a stable ref callback (fires in
 * commit, so it dodges the `react-hooks/set-state-in-effect` rule) — the button only
 * appears when the collapsed text actually overflows.
 */
'use client'

import { useCallback, useState } from 'react'

import { cn } from '@/lib/utils'

export function ExpandableText({
  text,
  moreLabel,
  lessLabel,
  className,
}: {
  text: string
  moreLabel: string
  lessLabel: string
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  // Stable → React runs it once on mount (collapsed), so we measure the real overflow.
  const measure = useCallback((el: HTMLParagraphElement | null) => {
    if (el) setOverflowing(el.scrollHeight - el.clientHeight > 1)
  }, [])

  return (
    <div className="flex flex-col items-start gap-1.5">
      <p
        ref={measure}
        className={cn('leading-relaxed text-muted-foreground', !expanded && 'line-clamp-2', className)}
      >
        {text}
      </p>
      {overflowing ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </div>
  )
}
