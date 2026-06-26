/**
 * Game output DTOs (§5): feed/search summaries, feed sections, filter options,
 * the library superset, and the full detail.
 *
 * NOTE (pending backend, see memory `seo-rendering-strategy`): a canonical `slug`
 * will be added to `gameSummarySchema` and `gameDtoSchema`, plus a
 * `GET /game/sitemaps` entry `{ id, slug, updatedAt }`. We mirror the CURRENT
 * contract here and will add `slug` once the backend ships it, to avoid validating
 * against a field that doesn't exist yet.
 */
import { z } from "zod";

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
} from "../enums";
import {
  companiesSchema,
  engineSchema,
  gameConsoleSchema,
  gameDlcSchema,
  gameReleaseDateSchema,
  ratingSchema,
  timeToBeatSchema,
} from "./common";

/** Card model used by feed, search and filter lists. */
export const gameSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: ratingSchema.optional(),
  cover: z.string().optional(),
  category: gameCategorySchema,
  status: gameStatusSchema,
  themes: z.array(gameThemeSchema),
  genres: z.array(gameGenreSchema),
  platforms: z.array(gameConsoleSchema),
  releaseDate: z.string().optional(), // ISO date
});
export type GameSummary = z.infer<typeof gameSummarySchema>;

/** One horizontal carousel of the home feed; paginates independently (§7). */
export const gameFeedSectionSchema = z.object({
  title: z.string(),
  section: gameSectionSchema,
  nextCursor: z.string().optional(),
  games: z.array(gameSummarySchema),
});
export type GameFeedSection = z.infer<typeof gameFeedSectionSchema>;

const keyNameSchema = z.object({ key: z.string(), name: z.string() });

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
});
export type GameFilterOptions = z.infer<typeof gameFilterOptionsSchema>;

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
});
export type GameLibrary = z.infer<typeof gameLibrarySchema>;

const gameMediaSchema = z.object({
  artworks: z.array(z.string()),
  cover: z.string().optional(),
  screenshots: z.array(z.string()),
  videos: z.array(z.string()),
});

const gameLanguageSchema = z.object({
  type: gameLanguageTypeSchema,
  categories: z.array(gameLanguageCategorySchema),
});

/** Full game detail — powers both the in-app detail and the public SEO page. */
export const gameDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  storyline: z.string().optional(),
  savedInLibrary: z.boolean(),
  ageRating: z.array(
    z.object({ organization: gameAgeRatingSchema, rate: z.string() }),
  ),
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
});
export type GameDto = z.infer<typeof gameDtoSchema>;
