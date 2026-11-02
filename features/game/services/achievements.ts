/**
 * Browser read of the full achievement catalogue. The static page never ships the
 * content of hidden achievements (id, name, description, icons), so the browser asks
 * for the public detail (public + cacheable, route language) when it needs them:
 * to reveal, to mark, or to place a member's marks.
 */
import { apiRequest } from '@/lib/api/client'
import { gameDtoSchema, type GameAchievement } from '@/lib/domain/models'
import type { Locale } from '@/lib/i18n'

export async function getPublicGameAchievements(
  slug: string,
  locale: Locale,
): Promise<GameAchievement[]> {
  const game = await apiRequest({
    method: 'GET',
    path: `/game/public/${slug}`,
    language: locale,
    schema: gameDtoSchema,
  })
  return game.achievements?.items ?? []
}
