/**
 * "See all" pager (Phase 5, Slice C) — a thin binding of the shared
 * `useCursorPagerList` to one feed section (`GET /game/filter/all`, opaque
 * cursor), from page one — like the apps, "see all" starts with the games the
 * carousel already shows. `section` is captured on mount: the see-all dialog
 * remounts per section (keyed by the flow), so it never changes mid-life.
 */
'use client'

import { CursorPager } from '@/lib/api/cursor-pager'
import {
  useCursorPagerList,
  type CursorPagerListState,
} from '@/lib/api/hooks/use-cursor-pager-list'
import type { GameSection } from '@/lib/domain/enums'
import type { GameSummary } from '@/lib/domain/models'

import { getGamesBySection } from '../services/catalog'

export function useSectionPager(section: GameSection): CursorPagerListState<GameSummary> {
  return useCursorPagerList<GameSummary>(
    () => new CursorPager((cursor) => getGamesBySection({ section, cursor })),
  )
}
