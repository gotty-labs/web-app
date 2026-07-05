import Image from 'next/image'

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
        <Image src={iconUrl} alt="" width={14} height={14} className="size-3.5" />
      ) : null}
      {label}
    </Badge>
  )
}
