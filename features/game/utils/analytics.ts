import { track } from '@/lib/analytics'

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
