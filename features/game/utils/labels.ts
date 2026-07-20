/**
 * Localized labels for game enums, read from the i18n dictionary (NEVER humanized
 * in code — a Spanish user must read "Rumoreado", not "Rumored").
 *
 * Pure functions taking the `Dictionary`, so they work both server-side
 * (`await getDictionary(locale)`) and client-side (`useDictionary()`).
 */
import type {
  GameAgeRating,
  GameCategory,
  GameGenre,
  GameLanguageCategory,
  GameLanguageType,
  GameLibraryProgressState,
  GameReleaseRegion,
  GameReleaseStatus,
  GameStatus,
  GameTheme,
  UserGameLibraryStatus,
} from '@/lib/domain/enums'
import type { Dictionary } from '@/lib/i18n'

export const gameStatusLabel = (dict: Dictionary, value: GameStatus): string =>
  dict.games.status[value]

export const gameCategoryLabel = (dict: Dictionary, value: GameCategory): string =>
  dict.games.category[value]

export const gameGenreLabel = (dict: Dictionary, value: GameGenre): string =>
  dict.games.genre[value]

export const gameThemeLabel = (dict: Dictionary, value: GameTheme): string =>
  dict.games.theme[value]

export const gameProgressStateLabel = (
  dict: Dictionary,
  value: GameLibraryProgressState,
): string => dict.games.progressState[value]

export const gameLibraryStatusLabel = (
  dict: Dictionary,
  value: UserGameLibraryStatus,
): string => dict.games.libraryStatus[value]

export const gameRegionLabel = (dict: Dictionary, value: GameReleaseRegion): string =>
  dict.games.region[value]

export const gameReleaseStatusLabel = (dict: Dictionary, value: GameReleaseStatus): string =>
  dict.games.releaseStatus[value]

/** The rating BOARD's name (ESRB, PEGI, …) — the `rate` value itself is free text. */
export const gameAgeRatingLabel = (dict: Dictionary, value: GameAgeRating): string =>
  dict.games.ageRating[value]

export const gameLanguageLabel = (dict: Dictionary, value: GameLanguageType): string =>
  dict.games.language[value]

export const gameLanguageCategoryLabel = (
  dict: Dictionary,
  value: GameLanguageCategory,
): string => dict.games.languageCategory[value]
