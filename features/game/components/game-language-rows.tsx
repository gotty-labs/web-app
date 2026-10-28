import { LanguageIcon } from '@/components/icons/language-icon'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { LANGUAGE_CATEGORIES, type GameLanguageRow } from '../utils/languages'

export function GameLanguageRows({
  rows,
  yourLanguageTag,
}: {
  rows: GameLanguageRow[]
  yourLanguageTag: string
}) {
  if (rows.length === 0) return null
  return (
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li
          key={row.type}
          aria-label={row.accessibleLabel}
          className="flex items-center gap-2 border-b border-border py-2 last:border-0"
        >
          <div
            aria-hidden="true"
            className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="text-sm font-semibold wrap-anywhere">{row.name}</span>
            {row.isYourLanguage && (
              <Badge
                variant="outline"
                className="h-auto max-w-full border-primary/25 bg-primary/10 py-1 text-primary whitespace-normal"
              >
                {yourLanguageTag}
              </Badge>
            )}
          </div>
          <div aria-hidden="true" className="flex shrink-0">
            {LANGUAGE_CATEGORIES.map((category) => (
              <span
                key={category}
                className="flex w-(--spacing-language-icon-slot) shrink-0 justify-center"
              >
                <LanguageIcon
                  category={category}
                  className={cn(
                    row.categories.includes(category)
                      ? 'text-primary'
                      : 'text-muted-foreground opacity-(--opacity-disabled)',
                  )}
                />
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  )
}
