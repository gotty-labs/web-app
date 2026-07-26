/**
 * Game output DTOs (§5): feed/search summaries, feed sections, filter options,
 * the library superset, and the full detail.
 *
 * `slug` (canonical, backend-owned) is modeled here as OPTIONAL so current
 * authed endpoints still validate before the backend ships it; the public SEO
 * layer (`GET /game/public/:slug`, `GET /game/sitemaps`) relies on it. See memory
 * `seo-rendering-strategy`. Make `slug` required once the backend guarantees it.
 */
import { z } from 'zod'

import {
  gameAgeRatingSchema,
  gameCategorySchema,
  gameGenreSchema,
  gameLanguageCategorySchema,
  gameLanguageTypeSchema,
  gameLibraryProgressStateSchema,
  gameSectionSchema,
  gameStatusSchema,
  gameThemeSchema,
  userGameLibraryStatusSchema,
} from '../enums'
import {
  companiesSchema,
  engineSchema,
  gameConsoleSchema,
  gameDlcSchema,
  gameLibraryListSchema,
  gameReleaseDateSchema,
  ratingSchema,
  timeToBeatSchema,
} from './common'

/** Card model used by feed, search and filter lists. */
export const gameSummarySchema = z.object({
  id: z.string(),
  slug: z.string().optional(), // backend-owned; used to link to /games/[slug]
  name: z.string(),
  rating: ratingSchema.optional(),
  cover: z.string().optional(),
  category: gameCategorySchema,
  status: gameStatusSchema,
  themes: z.array(gameThemeSchema),
  genres: z.array(gameGenreSchema),
  platforms: z.array(gameConsoleSchema),
  releaseDate: z.string().optional(), // ISO date
})
export type GameSummary = z.infer<typeof gameSummarySchema>

/** Compact entry from `GET /game/sitemaps` — drives static params + the sitemap. */
export const gameSitemapEntrySchema = z.object({
  id: z.string(),
  slug: z.string(),
  updatedAt: z.string(), // ISO date → sitemap <lastmod>
})
export type GameSitemapEntry = z.infer<typeof gameSitemapEntrySchema>

/** One horizontal carousel of the home feed; paginates independently (§7). */
export const gameFeedSectionSchema = z.object({
  title: z.string(),
  section: gameSectionSchema,
  nextCursor: z.string().optional(),
  games: z.array(gameSummarySchema),
})
export type GameFeedSection = z.infer<typeof gameFeedSectionSchema>

const keyNameSchema = z.object({ key: z.string(), name: z.string() })

export const gameFilterOptionsSchema = z.object({
  genres: z.array(keyNameSchema),
  themes: z.array(keyNameSchema),
  consoles: z.array(
    z.object({
      id: z.string(),
      cover: z.string(),
      name: z.string(),
      excluded: z.boolean(),
    }),
  ),
})
export type GameFilterOptions = z.infer<typeof gameFilterOptionsSchema>

/** Library item: a GameSummary enriched with the user's progress and extra meta. */
export const gameLibrarySchema = gameSummarySchema.extend({
  progress: z.object({
    status: userGameLibraryStatusSchema,
    state: gameLibraryProgressStateSchema,
    duration: z.number().optional(),
  }),
  timeToBeat: timeToBeatSchema.optional(),
  engines: z.array(engineSchema),
  companies: companiesSchema,
})
export type GameLibrary = z.infer<typeof gameLibrarySchema>

const gameMediaSchema = z.object({
  artworks: z.array(z.string()),
  cover: z.string().optional(),
  screenshots: z.array(z.string()),
  videos: z.array(z.string()),
})

const gameLanguageSchema = z.object({
  type: gameLanguageTypeSchema,
  categories: z.array(gameLanguageCategorySchema),
})

/** Full game detail — powers both the in-app detail and the public SEO page. */
export const gameDtoSchema = z.object({
  id: z.string(),
  slug: z.string().optional(), // backend-owned; canonical URL key
  name: z.string(),
  description: z.string().optional(),
  storyline: z.string().optional(),
  // User-specific library data is omitted altogether for a guest request.
  stored: z
    .object({
      saved: z.boolean(),
      // Optional while the enriched public endpoint is rolled out independently.
      lists: z.array(gameLibraryListSchema).optional(),
    })
    .optional(),
  ageRating: z.array(z.object({ organization: gameAgeRatingSchema, rate: z.string() })),
  rating: ratingSchema.optional(),
  timeToBeat: timeToBeatSchema.optional(),
  media: gameMediaSchema.optional(),
  category: gameCategorySchema,
  status: gameStatusSchema,
  dlcs: z.array(gameDlcSchema),
  expansions: z.array(gameDlcSchema),
  engines: z.array(engineSchema),
  themes: z.array(gameThemeSchema),
  genres: z.array(gameGenreSchema),
  companies: companiesSchema,
  languages: z.array(gameLanguageSchema),
  platforms: z.array(gameConsoleSchema),
  releaseDates: z.array(gameReleaseDateSchema),
})
export type GameDto = z.infer<typeof gameDtoSchema>
