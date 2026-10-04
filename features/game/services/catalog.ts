/**
 * Game catalog clients (§4.3). These reads use `authedRequest` in the web app so
 * the backend can enforce the authenticated web session where required.
 *
 * Query inputs are Zod-parsed before sending (client-side UX validation, e.g.
 * search needs ≥3 chars, limit 1..20).
 */
import { z } from 'zod'

import { authedRequest } from '@/features/auth'
import {
  gameFilterSectionInputSchema,
  gameSearchInputSchema,
  type GameFilterSectionInput,
  type GameSearchInput,
} from '@/lib/domain/inputs'
import {
  gameFeedSectionSchema,
  gameFilterOptionsSchema,
  gameSummarySchema,
  paginated,
  type GameFeedSection,
  type GameFilterOptions,
  type GameSummary,
  type Paginated,
} from '@/lib/domain/models'

/** Home feed: Netflix-style sections, each with its own cursor. */
export function getFeed(): Promise<GameFeedSection[]> {
  return authedRequest({
    method: 'GET',
    path: '/game/feed',
    schema: z.array(gameFeedSectionSchema),
  })
}

let filterOptionsInFlight: Promise<GameFilterOptions> | null = null

/**
 * Available filter options (genres, themes, consoles). Concurrent callers share one
 * request (the app shell and the explore controller both load it on /home); nothing is
 * cached once it settles, so later callers always get fresh options.
 */
export function getFilterOptions(): Promise<GameFilterOptions> {
  filterOptionsInFlight ??= authedRequest({
    method: 'GET',
    path: '/game/filter',
    schema: gameFilterOptionsSchema,
  }).finally(() => {
    filterOptionsInFlight = null
  })
  return filterOptionsInFlight
}

/** Free-text + faceted search (paginated). */
export function searchGames(input: GameSearchInput): Promise<Paginated<GameSummary>> {
  return authedRequest({
    method: 'GET',
    path: '/game/filter/search',
    query: gameSearchInputSchema.parse(input),
    schema: paginated(gameSummarySchema),
  })
}

/** Paginate a single feed section ("see all" / carousel load-more). */
export function getGamesBySection(input: GameFilterSectionInput): Promise<Paginated<GameSummary>> {
  return authedRequest({
    method: 'GET',
    path: '/game/filter/all',
    query: gameFilterSectionInputSchema.parse(input),
    schema: paginated(gameSummarySchema),
  })
}
