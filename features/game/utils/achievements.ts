import type { GameAchievement, GameAchievements } from '@/lib/domain/models'
import type { Dictionary, Locale } from '@/lib/i18n'
import { fillTemplate } from '@/lib/i18n/template'

import { formatCount } from './format'

/** Rows shown in the detail card; the rest live in the "see all" dialog. */
export const ACHIEVEMENTS_PREVIEW_COUNT = 3

/** Everything a row needs that can identify (and spoil) the achievement. */
export type AchievementContent = Pick<
  GameAchievement,
  'id' | 'name' | 'description' | 'iconUrl' | 'iconGrayUrl'
>

export type AchievementRarity = { label: string; a11y: string }

/**
 * Route-localized row. `content` is `null` for hidden achievements on the static page:
 * only their position, `hidden` and rarity travel in the HTML and the RSC payload.
 */
export type AchievementView = {
  /** 1-based Steam position, the stable key for rows and test ids. */
  position: number
  hidden: boolean
  rarity: AchievementRarity | null
  content: AchievementContent | null
}

export type AchievementsView = { total: number; items: AchievementView[] }

function toContent({ id, name, description, iconUrl, iconGrayUrl }: GameAchievement) {
  return { id, name, description, iconUrl, iconGrayUrl }
}

/** Visible chip (one decimal, locale format) and the full spoken phrase. */
export function formatAchievementRarity(
  rarity: number | null,
  locale: Locale,
  dict: Dictionary,
): AchievementRarity | null {
  if (rarity === null) return null
  const t = dict.app.detail.achievements
  if (rarity < 0.1) return { label: t.rarityRareShort, a11y: t.rarityRare }
  const label = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rarity / 100)
  return { label, a11y: fillTemplate(t.rarity, { rarity: label }) }
}

/** Server-side: the catalogue with the content of hidden achievements stripped. */
export function buildAchievementsView(
  achievements: GameAchievements | null,
  locale: Locale,
  dict: Dictionary,
): AchievementsView | null {
  if (!achievements || achievements.source !== 'STEAM' || achievements.items.length === 0) {
    return null
  }
  return {
    total: achievements.items.length,
    items: achievements.items.map((item, index) => ({
      position: index + 1,
      hidden: item.hidden,
      rarity: formatAchievementRarity(item.rarity, locale, dict),
      content: item.hidden ? null : toContent(item),
    })),
  }
}

/** Positions → content of every achievement, once the full catalogue is fetched. */
export function achievementContentByPosition(
  items: readonly GameAchievement[],
): Map<number, AchievementContent> {
  return new Map(items.map((item, index) => [index + 1, toContent(item)]))
}

/**
 * Rounded share of unlocked achievements (x.5 up) that never claims 100 % while one is
 * missing nor 0 % once one is unlocked.
 */
export function achievementProgress(achieved: number, total: number): number {
  if (total <= 0 || achieved <= 0) return 0
  if (achieved >= total) return 100
  const percent = Math.round((achieved / total) * 100)
  return Math.min(99, Math.max(1, percent))
}

/** Summary copy: "12 of 42 unlocked · 29%" with progress, "42 achievements" without. */
export function achievementsSummaryText(
  dict: Dictionary,
  locale: Locale,
  total: number,
  achieved: number | null,
) {
  const t = dict.app.detail.achievements
  if (achieved === null) {
    const text = fillTemplate(total === 1 ? t.totalOne : t.totalOther, {
      count: formatCount(total, locale),
    })
    return { text, percent: null, progress: null, a11y: `${t.sourceA11y}: ${text}` }
  }
  const progress = achievementProgress(achieved, total)
  const text = fillTemplate(t.progress, {
    achieved: formatCount(achieved, locale),
    total: formatCount(total, locale),
  })
  const percent = fillTemplate(t.percent, { progress })
  return { text, percent, progress, a11y: `${t.sourceA11y}: ${text}, ${percent}` }
}
