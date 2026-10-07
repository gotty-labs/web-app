/**
 * User-facing attribution to IGDB.com, the source of Gotty's game data. Required by the
 * IGDB commercial partnership, which accepted it on the support page. Rendered as one
 * more section of that page; the `{igdb}` placeholder in the copy becomes the link.
 */
import type { Dictionary } from '@/lib/i18n'

const IGDB_URL = 'https://www.igdb.com'

export function IgdbAttribution({ copy }: { copy: Dictionary['app']['legal']['igdbAttribution'] }) {
  const [before, after] = copy.text.split('{igdb}')

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">{copy.heading}</h2>
      <p className="text-base leading-7 text-muted-foreground">
        {before}
        {/* Referrer kept on purpose: IGDB sees the traffic their attribution brings. */}
        <a
          href={IGDB_URL}
          target="_blank"
          rel="noopener"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          IGDB.com
        </a>
        {after}
      </p>
    </section>
  )
}
