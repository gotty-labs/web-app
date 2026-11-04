import { track } from '@/lib/analytics'
import type { GameLanguagesView } from './languages'

export function trackLanguagesSheetOpened(
  gameId: string,
  languagesCount: number,
  level: GameLanguagesView['level'],
): void {
  track({
    name: 'languages_sheet_opened',
    properties: { game_id: gameId, languages_count: languagesCount, user_language_level: level },
  })
}

export type GameAddedDestination = 'library' | 'wishlist' | 'list'
export type GameAddedSourceScreen = 'feed' | 'search' | 'game_detail' | 'library'

export interface GameAddedMetadata {
  id: string
  name: string
  genres: readonly string[]
  platforms: readonly { id: string }[]
}

export function trackGameAdded(
  game: GameAddedMetadata,
  destination: GameAddedDestination,
  sourceScreen: GameAddedSourceScreen,
  listId?: string,
): void {
  const properties = {
    destination,
    game_id: game.id,
    game_title: game.name,
    source_screen: sourceScreen,
    genre: game.genres[0] ?? null,
    platform: game.platforms[0]?.id ?? null,
    ...(destination === 'list' && listId ? { list_id: listId } : {}),
  }

  track({ name: 'game_added', properties })
}

/** A game opened from the detail's "Related games" block (`position` is 1-based). */
export function trackRelatedGameOpened(
  sourceGameId: string,
  gameId: string,
  position: number,
): void {
  track({
    name: 'related_game_opened',
    properties: { source_game_id: sourceGameId, game_id: gameId, position },
  })
}
