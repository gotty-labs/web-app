/**
 * "Time to beat" as a small bar chart instead of a single number. The backend sends
 * up to three durations (quick / average / total, in seconds); each is drawn relative
 * to the largest, so you compare a rushed run against a completionist one at a glance.
 * Each row carries a representative icon (a sprinter for a rushed run, a controller for
 * an average one, a trophy for full completion). Bars grow in via a CSS keyframe (no
 * JS), so this stays a server component. Presentational — labels come from the caller.
 */
import { Gamepad2Icon, RabbitIcon, TrophyIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type TimeToBeatKind = 'quick' | 'average' | 'total'
export type TimeToBeatEntry = { kind: TimeToBeatKind; label: string; seconds: number; value: string }

const ICON: Record<TimeToBeatKind, typeof RabbitIcon> = {
  quick: RabbitIcon,
  average: Gamepad2Icon,
  total: TrophyIcon,
}

export function GameTimeToBeat({ entries }: { entries: TimeToBeatEntry[] }) {
  const max = Math.max(...entries.map((entry) => entry.seconds))
  return (
    <div className="flex flex-col gap-3.5 rounded-xl bg-card p-4 ring-1 ring-border">
      {entries.map((entry, index) => {
        const Icon = ICON[entry.kind]
        // Floor at 6% so a very short run is still a visible sliver.
        const pct = max > 0 ? Math.max(6, Math.round((entry.seconds / max) * 100)) : 0
        return (
          <div key={entry.kind} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Icon
                  className={cn('size-4', entry.kind === 'total' ? 'text-primary' : 'text-muted-foreground')}
                />
                {entry.label}
              </span>
              <span className="font-semibold tabular-nums">{entry.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="animate-bar-grow h-full origin-left rounded-full bg-linear-to-r from-primary/60 to-primary"
                style={{ width: `${pct}%`, animationDelay: `${index * 120}ms` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
