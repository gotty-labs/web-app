/**
 * One achievement, identical in the detail preview and the "see all" dialog: icon slot,
 * text column (one-line name + rarity chip, wrapping description) and toggle slot. Both
 * slots share one token width so they line up across rows.
 *
 * Title line: the name truncates with an ellipsis and the chip keeps its natural width
 * right after it. The name's flex basis is half the column (capped at its own width),
 * so the chip only wraps under the name when keeping it inline would leave the name
 * less than half of the column (in practice, with enlarged text).
 *
 * Hidden achievements stay a padlock + "Hidden achievement" until revealed; the reveal
 * button stretches over the row (so a click anywhere but the toggle reveals) while
 * the toggle sits above it. The switch carries the whole row as its accessible name.
 */
'use client'

import { useId, useState } from 'react'
import { CheckIcon, ImageIcon, LockIcon, UserIcon } from 'lucide-react'

import { AppImage } from '@/components/app-image'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import type { AchievementControl } from '../hooks/use-game-achievements'
import type { AchievementContent, AchievementView } from '../utils/achievements'

const SLOT = 'flex size-(--spacing-achievement-icon) shrink-0 items-center justify-center'

function AchievementIcon({ src }: { src: string | null }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (!src || failedSrc === src) {
    return (
      <span aria-hidden className={cn(SLOT, 'rounded-md bg-muted text-muted-foreground')}>
        <ImageIcon className="size-5" />
      </span>
    )
  }
  return (
    <AppImage
      src={src}
      alt=""
      fill
      unoptimized
      onError={() => setFailedSrc(src)}
      wrapperClassName={cn(SLOT, 'rounded-md')}
      className="object-cover"
    />
  )
}

export function AchievementRow({
  item,
  content,
  revealed,
  achieved,
  control,
  onToggle,
  onReveal,
}: {
  item: AchievementView
  /** `null` while a hidden achievement's content is unknown. */
  content: AchievementContent | null
  revealed: boolean
  achieved: boolean
  control: AchievementControl
  onToggle: () => void
  onReveal: () => void
}) {
  const t = useDictionary().app.detail.achievements
  const hintId = useId()
  // Once unlocked on this surface, a hidden achievement stays revealed while it's open
  // (also after unmarking it or removing the game). Derived during render, no effect.
  const [wasAchieved, setWasAchieved] = useState(achieved)
  if (achieved && !wasAchieved) setWasAchieved(true)
  const shown = content !== null && (!item.hidden || revealed || achieved || wasAchieved)
  const name = shown ? content.name : t.hiddenTitle
  const description = shown ? content.description : null
  const chipLabel =
    item.hidden && shown
      ? item.rarity
        ? `${t.hiddenPrefix} · ${item.rarity.label}`
        : t.hiddenPrefix
      : (item.rarity?.label ?? null)
  const accessibleName = [
    item.hidden && shown ? t.hiddenPrefix : null,
    name,
    description,
    item.rarity?.a11y,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <li className="relative flex items-center gap-3 px-4 py-2">
      {shown ? (
        <AchievementIcon src={achieved ? content.iconUrl : content.iconGrayUrl} />
      ) : (
        <span
          aria-hidden
          className={cn(SLOT, 'rounded-md bg-secondary text-muted-foreground ring-1 ring-border')}
        >
          <LockIcon className="size-5" />
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div aria-hidden className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span
            title={shown ? name : undefined}
            className="min-w-0 max-w-max grow basis-1/2 truncate text-sm font-semibold"
          >
            {name}
          </span>
          {chipLabel ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-foreground">
              {chipLabel}
              {item.rarity ? <UserIcon className="size-4 text-muted-foreground" /> : null}
            </span>
          ) : null}
        </div>
        {description ? (
          <p aria-hidden className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
        {shown || !item.hidden ? null : (
          <button
            type="button"
            data-testid={`button.game_achievement_reveal.${item.position}`}
            aria-label={t.revealA11y}
            onClick={onReveal}
            className="w-fit cursor-pointer rounded-sm text-left text-sm font-semibold text-primary outline-none after:absolute after:inset-0 hover:underline focus-visible:after:rounded-md focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
          >
            {t.hiddenRevealClick}
          </button>
        )}
      </div>

      {control === 'none' ? (
        <span className="sr-only">{accessibleName}</span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={achieved}
          aria-label={accessibleName}
          aria-describedby={control === 'auth' ? hintId : undefined}
          data-testid={`toggle.game_achievement.${item.position}`}
          disabled={control === 'disabled'}
          onClick={onToggle}
          className={cn(
            SLOT,
            'relative z-10 cursor-pointer rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-(--opacity-disabled) disabled:hover:bg-transparent',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'flex size-7 items-center justify-center rounded-full',
              achieved ? 'bg-success text-success-foreground' : 'border-2 border-border',
            )}
          >
            {achieved ? <CheckIcon className="size-4" /> : null}
          </span>
          {control === 'auth' ? (
            <span id={hintId} className="sr-only">
              {t.signInHint}
            </span>
          ) : null}
        </button>
      )}
    </li>
  )
}
