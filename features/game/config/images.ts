/** Shared image assets and fallbacks used by every game-cover flow. */
export const GAME_COVER_PLACEHOLDER = '/assets/images/game-cover-placeholder.png'

/** Returns the supplied cover or the branded placeholder when it is missing. */
export function getGameCover(cover?: string | null): string {
  return cover?.trim() || GAME_COVER_PLACEHOLDER
}
