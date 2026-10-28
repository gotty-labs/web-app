import { LanguageIcon } from '@/components/icons/language-icon'
import { Badge } from '@/components/ui/badge'
import type { GameDto } from '@/lib/domain/models'
import type { Dictionary, Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { buildGameLanguages } from '../utils/languages'
import { DetailSection } from './detail-section'
import { GameLanguageRows } from './game-language-rows'
import { GameLanguagesDialog } from './game-languages-dialog'

/** Route-localized server overview; only opening/filtering is a client island. */
export function GameLanguages({
  dict,
  languages,
  locale,
  gameId,
}: {
  dict: Dictionary
  languages: GameDto['languages']
  locale: Locale
  gameId: string
}) {
  const view = buildGameLanguages(languages, locale, dict)
  if (!view.rows.length) return null
  const t = dict.games.languages
  const expanded = view.rows.length >= 5
  return (
    <DetailSection
      title={dict.app.detail.languages}
      className="game-languages"
      action={
        expanded ? (
          <GameLanguagesDialog
            key={gameId}
            gameId={gameId}
            view={view}
            labels={{
              all: t.filterAll,
              yourLanguageTag: t.yourLanguageTag,
              close: dict.app.actions.close,
            }}
          />
        ) : undefined
      }
    >
      <div
        role="img"
        aria-label={view.accessibleCard}
        className="@container/language-card flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-border"
      >
        <div aria-hidden="true" className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-base font-bold wrap-anywhere">{view.title}</h3>
          <Badge
            variant="outline"
            className={cn(
              'h-auto max-w-full px-3 py-1 text-sm whitespace-normal',
              view.level === 'unavailable'
                ? 'border-border bg-secondary text-muted-foreground'
                : 'border-primary/25 bg-primary/10 text-primary',
            )}
          >
            {view.levelLabel}
          </Badge>
        </div>
        <div
          aria-hidden="true"
          className="language-indicators flex flex-col gap-2 @min-2xs/language-card:flex-row"
        >
          {view.indicators.map((item) => (
            <div
              key={item.category}
              className="language-indicator flex flex-1 items-center gap-2 py-1 @min-2xs/language-card:flex-col @min-2xs/language-card:gap-1"
            >
              <LanguageIcon
                category={item.category}
                className={cn(
                  'size-5',
                  item.available
                    ? 'text-primary'
                    : 'text-muted-foreground opacity-(--opacity-disabled)',
                )}
              />
              <span
                className={cn(
                  'text-sm font-semibold',
                  item.available ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </span>
              {item.count === 0 && (
                <Badge
                  variant="outline"
                  className="h-auto max-w-full py-1 text-muted-foreground whitespace-normal"
                >
                  {t.stateNoData}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
      {expanded ? (
        <>
          <div
            role="img"
            aria-label={view.accessibleSummary}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
          >
            {view.summary.map((item, index) => (
              <span
                key={item.category}
                aria-hidden="true"
                className="inline-flex items-center gap-1"
              >
                {index > 0 && <span className="mr-1">·</span>}
                <LanguageIcon category={item.category} />
                {item.count}
              </span>
            ))}
          </div>
          <div role="img" aria-label={view.accessibleChips} className="flex flex-wrap gap-2">
            {view.chips.map((chip) => (
              <Badge
                key={chip.type}
                aria-hidden="true"
                variant="secondary"
                className="h-auto max-w-full border-border px-3 py-1 text-sm"
              >
                <span className="truncate">{chip.name}</span>
              </Badge>
            ))}
            {view.more > 0 && (
              <Badge
                aria-hidden="true"
                variant="secondary"
                className="h-auto px-3 py-1 text-sm text-muted-foreground"
              >
                {view.moreLabel}
              </Badge>
            )}
          </div>
        </>
      ) : (
        <GameLanguageRows rows={view.inlineRows} yourLanguageTag={t.yourLanguageTag} />
      )}
    </DetailSection>
  )
}
