/**
 * On-the-wire enums — mirror the backend contract (§6) exactly.
 *
 * Each enum is defined once as a Zod schema (single source of truth) and the
 * matching TypeScript union type is inferred from it. This keeps runtime
 * validation and compile-time types from ever drifting apart.
 *
 * Value access (when you need the literal, not just the type) is available via
 * the schema's `.enum` map, e.g. `gameSectionSchema.enum.TRENDING`.
 */
import { z } from 'zod'

export const platformSchema = z.enum(['IOS', 'ANDROID', 'WEB'])
export type Platform = z.infer<typeof platformSchema>

export const jgLanguageSchema = z.enum(['en', 'es'])
export type JgLanguage = z.infer<typeof jgLanguageSchema>

export const appVersionStatusSchema = z.enum([
  'UP_TO_DATE',
  'NEW_VERSION_AVAILABLE',
  'UPDATE_REQUIRED',
])
export type AppVersionStatus = z.infer<typeof appVersionStatusSchema>

/** Feed order = declaration order (§6). */
export const gameSectionSchema = z.enum([
  'UPCOMING_RELEASES',
  'QUICK_TIME',
  'TRENDING',
  'LAST_VIEWED',
  'FAMILY',
  'RATING',
  'CLASSIC',
  'RECENTLY_ADDED',
  'SEASON',
])
export type GameSection = z.infer<typeof gameSectionSchema>

export const gameCategorySchema = z.enum(['MAIN', 'REMAKE', 'REMASTER'])
export type GameCategory = z.infer<typeof gameCategorySchema>

export const gameStatusSchema = z.enum([
  'RELEASED',
  'ALPHA',
  'BETA',
  'EARLY_ACCESS',
  'CANCELLED',
  'RUMORED',
  'DELISTED',
  'UNKNOWN',
])
export type GameStatus = z.infer<typeof gameStatusSchema>

export const gameGenreSchema = z.enum([
  'POINT_AND_CLICK',
  'FIGHTING',
  'SHOOTER',
  'MUSIC',
  'PLATFORM',
  'PUZZLE',
  'RACING',
  'REAL_TIME_STRATEGY',
  'ROLE_PLAYING',
  'SIMULATOR',
  'SPORT',
  'STRATEGY',
  'TURN_BASED_STRATEGY',
  'TACTICAL',
  'HACK_AND_SLASH',
  'QUIZ_TRIVIA',
  'PINBALL',
  'ADVENTURE',
  'INDIE',
  'ARCADE',
  'VISUAL_NOVEL',
  'CARD_AND_BOARD_GAME',
  'MOBA',
])
export type GameGenre = z.infer<typeof gameGenreSchema>

export const gameThemeSchema = z.enum([
  'ACTION',
  'FANTASY',
  'SCIENCE_FICTION',
  'HORROR',
  'THRILLER',
  'SURVIVAL',
  'HISTORICAL',
  'STEALTH',
  'COMEDY',
  'BUSINESS',
  'DRAMA',
  'NON_FICTION',
  'SANDBOX',
  'EDUCATIONAL',
  'KIDS',
  'OPEN_WORLD',
  'WARFARE',
  'PARTY',
  'FOUR_X',
  'EROTIC',
  'MYSTERY',
  'ROMANCE',
])
export type GameTheme = z.infer<typeof gameThemeSchema>

export const gameAgeRatingSchema = z.enum([
  'ESRB',
  'PEGI',
  'CERO',
  'USK',
  'GRAC',
  'CLASS_IND',
  'ACB',
])
export type GameAgeRating = z.infer<typeof gameAgeRatingSchema>

export const gameLanguageCategorySchema = z.enum(['AUDIO', 'SUBTITLES', 'INTERFACE'])
export type GameLanguageCategory = z.infer<typeof gameLanguageCategorySchema>

export const gameLanguageTypeSchema = z.enum([
  'ARABIC',
  'CHINESE_SIMPLIFIED',
  'CHINESE_TRADITIONAL',
  'CZECH',
  'DANISH',
  'DUTCH',
  'ENGLISH_US',
  'ENGLISH_UK',
  'SPANISH_SPAIN',
  'SPANISH_MEXICO',
  'FRENCH',
  'GERMAN',
  'HUNGARIAN',
  'ITALIAN',
  'JAPANESE',
  'KOREAN',
  'NORWEGIAN',
  'POLISH',
  'PORTUGUESE_BRAZIL',
  'PORTUGUESE_PORTUGAL',
  'RUSSIAN',
  'SWEDISH',
  'TURKISH',
  'THAI',
  'FINNISH',
  'UKRAINIAN',
  'VIETNAMESE',
  'HEBREW',
])
export type GameLanguageType = z.infer<typeof gameLanguageTypeSchema>

export const gameReleaseRegionSchema = z.enum([
  'EUROPE',
  'NORTH_AMERICA',
  'AUSTRALIA',
  'NEW_ZEALAND',
  'JAPAN',
  'CHINA',
  'ASIA',
  'WORLDWIDE',
  'KOREA',
  'BRAZIL',
])
export type GameReleaseRegion = z.infer<typeof gameReleaseRegionSchema>

export const gameReleaseStatusSchema = z.enum([
  'ALPHA',
  'BETA',
  'EARLY_ACCESS',
  'OFFLINE',
  'CANCELLED',
  'FULL_RELEASE',
  'ADVANCED_ACCESS',
  'DIGITAL_COMPATIBILITY_RELEASE',
  'NEXT_GEN_OPTIMIZATION_PATCH_RELEASE',
])
export type GameReleaseStatus = z.infer<typeof gameReleaseStatusSchema>

export const gameLibraryProgressStateSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'BLOCKED',
  'COMPLETED',
])
export type GameLibraryProgressState = z.infer<typeof gameLibraryProgressStateSchema>

export const userGameLibraryStatusSchema = z.enum(['SAVED', 'WHITELIST'])
export type UserGameLibraryStatus = z.infer<typeof userGameLibraryStatusSchema>

export const consoleFamilySchema = z.enum(['PLAY', 'XBOX', 'SEGA', 'LINUX', 'NINTENDO'])
export type ConsoleFamily = z.infer<typeof consoleFamilySchema>

export const consoleTypeSchema = z.enum([
  'CONSOLE',
  'ARCADE',
  'PLATFORM',
  'OPERATING_SYSTEM',
  'PORTABLE_CONSOLE',
  'COMPUTER',
])
export type ConsoleType = z.infer<typeof consoleTypeSchema>
