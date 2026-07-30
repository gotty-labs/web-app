/**
 * Game input schemas (§4.3). Query inputs compose cursor pagination; body inputs
 * cover library list creation/update and the per-game library upsert.
 */
import { z } from 'zod'

import {
  gameLibraryProgressStateSchema,
  gameSectionSchema,
  userGameLibraryStatusSchema,
} from '../enums'
import { cursorPaginationSchema } from './common'

/** `GET /game/filter/search` — free-text search needs ≥3 chars. */
export const gameSearchInputSchema = cursorPaginationSchema.extend({
  query: z.string().min(3).optional(),
  consoleIds: z.array(z.string()).optional(),
  content: z.string().optional(),
})
export type GameSearchInput = z.infer<typeof gameSearchInputSchema>

/** `GET /game/filter/all` — paginate one feed section. */
export const gameFilterSectionInputSchema = cursorPaginationSchema.extend({
  section: gameSectionSchema,
})
export type GameFilterSectionInput = z.infer<typeof gameFilterSectionInputSchema>

/** `GET /game/user/library` — filter the user's library. */
export const getUserLibraryInputSchema = cursorPaginationSchema.extend({
  status: userGameLibraryStatusSchema.optional(),
  listId: z.string().optional(),
})
export type GetUserLibraryInput = z.infer<typeof getUserLibraryInputSchema>

/** Backend `HexColorValidator`: accepts `#RGB` or `#RRGGBB`. */
const hexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color')

export const createLibraryListInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  hexColor: hexColorSchema,
  icon: z.string().min(1),
  gameIds: z.array(z.string()).optional(),
})
export type CreateLibraryListInput = z.infer<typeof createLibraryListInputSchema>

/** `PATCH /game/user/library/list/:listId` — add/remove games (non-empty). */
export const updateLibraryListInputSchema = z.object({
  gameIds: z.array(z.string()).min(1),
  save: z.boolean(),
})
export type UpdateLibraryListInput = z.infer<typeof updateLibraryListInputSchema>

/** `PATCH /game/user/library/:gameId` — save/whitelist + progress tracking. */
export const storeGameLibraryInputSchema = z.object({
  status: userGameLibraryStatusSchema.optional(),
  state: gameLibraryProgressStateSchema.optional(),
  progressDuration: z.number().min(0).optional(),
})
export type StoreGameLibraryInput = z.infer<typeof storeGameLibraryInputSchema>
