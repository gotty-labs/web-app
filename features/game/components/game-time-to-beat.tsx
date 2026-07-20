/**
 * "Time to beat" as a small bar chart instead of a single number. The backend sends
 * up to three durations (quick / average / total, in seconds); each is drawn relative
 * to the largest, so you compare a rushed run against a completionist one at a glance.
 * Bars grow in via a CSS keyframe (no JS), so this stays a server component.
 * Presentational — the caller resolves the labels from the dictionary.
 */
import { formatTimeToBeat } from '../utils/format'

export type TimeToBeatEntry = { label: string; seconds: number }

export function GameTimeToBeat({ entries }: { entries: TimeToBeatEntry[] }) {
  const max = Math.max(...entries.map((entry) => entry.seconds))
  return (
    <div className="flex flex-col gap-3.5 rounded-xl bg-card p-4 ring-1 ring-border">
      {entries.map((entry, index) => {
        // Floor at 6% so a very short run is still a visible sliver.
        const pct = max > 0 ? Math.max(6, Math.round((entry.seconds / max) * 100)) : 0
        return (
          <div key={entry.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">{entry.label}</span>
              <span className="font-semibold tabular-nums">{formatTimeToBeat(entry.seconds)}</span>
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
