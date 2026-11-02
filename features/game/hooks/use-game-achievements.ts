/**
 * Achievement state for the detail block and its "see all" dialog (one instance, so
 * both always show the same marks). Marks live in the shared library state:
 *
 *  - Marking is optimistic and never rolls back nor reports a failure; the next load
 *    of the page shows what was really stored.
 *  - Repeated taps on an achievement whose mark is in flight are ignored.
 *  - A successful mark leaves the game in Library: the library menu turns "saved" and,
 *    when the game wasn't saved, `game_added` fires once for the page.
 *  - Hidden achievements arrive without content; it is fetched from the browser (once
 *    per visit) to reveal or mark them, or to place a member's existing marks.
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { authPromptStore } from '@/features/auth'
import type { Locale } from '@/lib/i18n'

import { getPublicGameAchievements } from '../services/achievements'
import { markGameAchievement } from '../services/library'
import { trackGameAdded, type GameAddedMetadata } from '../utils/analytics'
import {
  achievementContentByPosition,
  type AchievementContent,
  type AchievementsView,
} from '../utils/achievements'

import { useGameLibraryState } from './use-game-library-state'

/** What each row's toggle does: sign-in prompt, wait, mark, or nothing at all. */
export type AchievementControl = 'auth' | 'disabled' | 'active' | 'none'

export interface GameAchievementsState {
  total: number
  control: AchievementControl
  /** Unlocked count, or `null` when there is no personal progress to show. */
  achievedCount: number | null
  contentAt: (position: number) => AchievementContent | null
  isAchieved: (position: number) => boolean
  /** Loads hidden content (no-op once loaded). */
  loadHidden: () => void
  toggle: (position: number) => void
}

export function useGameAchievements({
  view,
  slug,
  locale,
  game,
}: {
  view: AchievementsView
  slug: string
  locale: Locale
  game: GameAddedMetadata
}): GameAchievementsState {
  const { phase, state, update } = useGameLibraryState()
  const [hiddenContent, setHiddenContent] = useState<Map<number, AchievementContent> | null>(null)
  const hiddenRequest = useRef<Promise<Map<number, AchievementContent> | null> | null>(null)
  const pending = useRef(new Set<number>())
  const addedTracked = useRef(false)

  const fetchHidden = useCallback(() => {
    hiddenRequest.current ??= getPublicGameAchievements(slug, locale)
      .then((items) => {
        const content = achievementContentByPosition(items)
        setHiddenContent(content)
        return content
      })
      .catch(() => {
        // Stays hidden (and unmarkable); a later reveal or mark tries again.
        hiddenRequest.current = null
        return null
      })
    return hiddenRequest.current
  }, [slug, locale])

  const contentAt = (position: number) =>
    view.items[position - 1]?.content ?? hiddenContent?.get(position) ?? null

  const achievedIds = new Set(phase === 'ready' ? (state?.achievedAchievementIds ?? []) : [])
  const isAchieved = (position: number) => {
    const content = contentAt(position)
    return content !== null && achievedIds.has(content.id)
  }

  // A member's marks may point at hidden achievements, which only the fetched
  // content can place.
  const knownIds = new Set(view.items.flatMap((item) => (item.content ? [item.content.id] : [])))
  const needsHidden = [...achievedIds].some((id) => !knownIds.has(id))
  useEffect(() => {
    if (needsHidden) void fetchHidden()
  }, [needsHidden, fetchHidden])

  const control: AchievementControl =
    phase === 'anonymous'
      ? 'auth'
      : phase === 'ready'
        ? 'active'
        : phase === 'error'
          ? 'none'
          : 'disabled'

  async function mark(position: number) {
    let content = contentAt(position)
    if (!content) content = (await fetchHidden())?.get(position) ?? null
    if (!content || !state) return

    const { id } = content
    const achieved = !achievedIds.has(id)
    const wasSaved = state.saved
    update((current) => {
      const others = current.achievedAchievementIds.filter((other) => other !== id)
      return { ...current, achievedAchievementIds: achieved ? [...others, id] : others }
    })

    await markGameAchievement(game.id, { id, achieved })
    if (!achieved) return
    update((current) => (current.saved ? current : { ...current, saved: true }))
    if (!wasSaved && !addedTracked.current) {
      addedTracked.current = true
      trackGameAdded(game, 'library', 'game_detail')
    }
  }

  function toggle(position: number) {
    if (control === 'auth') {
      authPromptStore.show()
      return
    }
    if (control !== 'active' || pending.current.has(position)) return
    pending.current.add(position)
    mark(position)
      .catch(() => {
        // Decided behavior: keep the optimistic state, no message.
      })
      .finally(() => pending.current.delete(position))
  }

  return {
    total: view.total,
    control,
    achievedCount: phase === 'ready' ? Math.min(achievedIds.size, view.total) : null,
    contentAt,
    isAchieved,
    loadHidden: () => void fetchHidden(),
    toggle,
  }
}
