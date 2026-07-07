/**
 * Infinite horizontal marquee of game genres. Reuses the ALREADY-localized
 * enum labels from `dict.games.genre` — zero new copy. The track holds two
 * identical sets (each with its own trailing gap via `pr-*`), so the CSS
 * `animate-marquee` -50% loop is seamless. Decorative → `aria-hidden`.
 */
import type { Dictionary } from '@/lib/i18n'

export function GenreMarquee({ dict }: { dict: Dictionary }) {
  const labels = Object.values(dict.games.genre)

  const set = (
    <div className="flex shrink-0 items-center gap-3 pr-3">
      {labels.map((label) => (
        <span
          key={label}
          className="rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-sm text-muted-foreground"
        >
          {label}
        </span>
      ))}
    </div>
  )

  return (
    <section
      aria-hidden
      className="overflow-hidden border-y border-border/40 bg-card/20 py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
    >
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {set}
        {set}
      </div>
    </section>
  )
}
