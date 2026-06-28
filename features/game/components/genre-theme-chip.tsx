import { Badge } from '@/components/ui/badge'

/**
 * Outlined chip for a genre/theme, with an optional characteristic icon.
 * Presentational: the caller passes the (humanized/localized) `label`.
 *
 * NOTE (backend gap): `GameFilterContentDto` should expose an icon URL per
 * genre/theme — pass it as `iconUrl` once available.
 */
export function GenreThemeChip({ label, iconUrl }: { label: string; iconUrl?: string }) {
  return (
    <Badge variant="outline">
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- small remote icon; migrate to next/image + remotePatterns when host is known
        <img src={iconUrl} alt="" className="size-3.5" />
      ) : null}
      {label}
    </Badge>
  )
}
