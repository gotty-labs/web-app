/**
 * Section wrapper for the game detail content — a consistent heading (with a violet
 * accent bar) plus an optional right-aligned action (e.g. a "See all" trigger).
 * Presentational and server-safe; keeps the big `GameDetail` layout readable.
 */
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function DetailSection({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-pixel text-lg font-semibold sm:text-xl">
          <span aria-hidden className="h-5 w-1 rounded-full bg-primary" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
