/**
 * User library clients (§4.3, Member-access endpoints — token required, no guests).
 * All go through `authedRequest`. Bodies/queries are Zod-parsed before sending.
 *
 * Covers: custom lists CRUD, the paginated library, and the per-game upsert that
 * powers save / whitelist / progress tracking.
 */
import { z } from 'zod'

import { authedRequest } from '@/features/auth'
import { voidDataSchema } from '@/lib/api/envelope'
import {
  createLibraryListInputSchema,
  getUserLibraryInputSchema,
  storeGameLibraryInputSchema,
  updateLibraryListInputSchema,
  type CreateLibraryListInput,
  type GetUserLibraryInput,
  type StoreGameLibraryInput,
  type UpdateLibraryListInput,
} from '@/lib/domain/inputs'
import {
  gameLibraryListSchema,
  gameLibrarySchema,
  paginated,
  type GameLibrary,
  type GameLibraryList,
  type Paginated,
} from '@/lib/domain/models'

export function getLibraryLists(): Promise<GameLibraryList[]> {
  return authedRequest({
    method: 'GET',
    path: '/game/user/library/lists',
    schema: z.array(gameLibraryListSchema),
  })
}

export function createLibraryList(input: CreateLibraryListInput): Promise<GameLibraryList> {
  return authedRequest({
    method: 'POST',
    path: '/game/user/library/lists',
    body: createLibraryListInputSchema.parse(input),
    schema: gameLibraryListSchema,
  })
}

export function getLibrary(input: GetUserLibraryInput = {}): Promise<Paginated<GameLibrary>> {
  return authedRequest({
    method: 'GET',
    path: '/game/user/library',
    query: getUserLibraryInputSchema.parse(input),
    schema: paginated(gameLibrarySchema),
  })
}

export async function updateLibraryList(
  listId: string,
  input: UpdateLibraryListInput,
): Promise<void> {
  await authedRequest({
    method: 'PATCH',
    path: `/game/user/library/list/${listId}`,
    body: updateLibraryListInputSchema.parse(input),
    schema: voidDataSchema,
  })
}

export async function deleteLibraryList(listId: string): Promise<void> {
  await authedRequest({
    method: 'DELETE',
    path: `/game/user/library/list/${listId}`,
    schema: voidDataSchema,
  })
}

/** Save / whitelist a game and/or update its progress (state, duration). */
export async function storeGameInLibrary(
  gameId: string,
  input: StoreGameLibraryInput,
): Promise<void> {
  await authedRequest({
    method: 'PATCH',
    path: `/game/user/library/${gameId}`,
    body: storeGameLibraryInputSchema.parse(input),
    schema: voidDataSchema,
  })
}

/**
 * Remove a game from the user's library (undo of save/whitelist). The backend has no
 * DELETE route (404); removal is a PATCH on the same upsert resource that clears the
 * status (`{ status: null }` drops the entry). Sent raw (not through
 * `storeGameLibraryInputSchema`, which doesn't model the null-clear).
 */
export async function removeGameFromLibrary(gameId: string): Promise<void> {
  await authedRequest({
    method: 'PATCH',
    path: `/game/user/library/${gameId}`,
    body: { status: null },
    schema: voidDataSchema,
  })
}
