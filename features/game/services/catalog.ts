/**
 * Game catalog clients (§4.3, Guest-access endpoints). In the authenticated web
 * app these go through `authedRequest` — a token is sent (the backend allows it on
 * Guest routes). Game detail reads hit the SINGLE canonical public endpoint
 * (`GET /game/public/:slug`, same as the SEO zone); passing the token lets the
 * backend enrich the response with user-specific fields (`stored`, and
 * future per-user data) when present, and return the plain public shape otherwise.
 *
 * Query inputs are Zod-parsed before sending (client-side UX validation, e.g.
 * search needs ≥3 chars, limit 1..20).
 *
 * The PUBLIC SEO variants (server-side, no token) are a separate Phase-4 slice,
 * blocked on the backend's public endpoints + slug.
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
  gameDtoSchema,
  gameFeedSectionSchema,
  gameFilterOptionsSchema,
  gameSummarySchema,
  paginated,
  type GameDto,
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

/** Available filter options (genres, themes, consoles). */
export function getFilterOptions(): Promise<GameFilterOptions> {
  return authedRequest({
    method: 'GET',
    path: '/game/filter',
    schema: gameFilterOptionsSchema,
  })
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

/**
 * Game detail read CLIENT-SIDE with the user's token. Hits the SAME public endpoint
 * the SEO zone reads (`/game/public/:slug`), but via `authedRequest` so the JWT rides
 * along and the backend can add user-specific fields (`stored`, …). One
 * canonical game endpoint for the whole web — no `/game/:id` split. The cached SSG
 * render (no token) still shows the plain public shape.
 */
export function getGameForUser(slug: string): Promise<GameDto> {
  return authedRequest({
    method: 'GET',
    path: `/game/public/${slug}`,
    schema: gameDtoSchema,
  })
}
