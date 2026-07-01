/**
 * Shared output sub-models (§5) reused across game/library/detail DTOs, plus the
 * generic cursor-paginated envelope (§7).
 *
 * Dates are kept as raw ISO 8601 strings on purpose: the backend serializes them
 * as strings and we deliberately do NOT over-validate the format here (a too-strict
 * datetime check could reject a valid date-only value and break a static build).
 * Parsing to `Date` is a presentation concern handled at the edge.
 */
import { z } from 'zod'

import { consoleFamilySchema, gameReleaseRegionSchema, gameReleaseStatusSchema } from '../enums'

export const ratingSchema = z.object({
  value: z.number().optional(),
  quantity: z.number().optional(),
})
export type Rating = z.infer<typeof ratingSchema>

/** Durations are seconds (HowLongToBeat-style); absent when unknown. */
export const timeToBeatSchema = z.object({
  average: z.number().optional(),
  total: z.number().optional(),
  quick: z.number().optional(),
})
export type TimeToBeat = z.infer<typeof timeToBeatSchema>

export const companiesSchema = z.object({
  develop: z.array(z.string()),
  publish: z.array(z.string()),
  support: z.array(z.string()),
})
export type Companies = z.infer<typeof companiesSchema>

export const engineSchema = z.object({
  name: z.string(),
  logo: z.string().optional(),
})
export type Engine = z.infer<typeof engineSchema>

export const gameConsoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  family: consoleFamilySchema.nullish(),
  image: z.string().optional(),
})
export type GameConsole = z.infer<typeof gameConsoleSchema>

export const gameLibraryListSchema = z.object({
  id: z.string(),
  name: z.string(),
  hexColor: z.string(),
  icon: z.string(),
})
export type GameLibraryList = z.infer<typeof gameLibraryListSchema>

export const gameReleaseDateSchema = z.object({
  date: z.string(), // ISO date
  console: gameConsoleSchema,
  region: gameReleaseRegionSchema,
  status: gameReleaseStatusSchema.optional(),
})
export type GameReleaseDate = z.infer<typeof gameReleaseDateSchema>

export const gameDlcSchema = z.object({
  name: z.string(),
  cover: z.string(),
  releases: z.array(gameReleaseDateSchema),
})
export type GameDlc = z.infer<typeof gameDlcSchema>

/**
 * Generic cursor-paginated list (§7). `cursor` is an opaque token — never parse
 * or construct it. `nextCursor === undefined` means end of list.
 *
 * Implemented as a factory so each list endpoint composes it with its own item
 * schema, e.g. `paginated(gameSummarySchema)`.
 */
export const paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z.string().optional(),
  })
export type Paginated<T> = { items: T[]; nextCursor?: string }
