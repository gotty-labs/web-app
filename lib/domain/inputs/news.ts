/**
 * `GET /news` query. `excludedSources` is serialized as a repeated param
 * (`excludedSources=ign&excludedSources=vandal`) by the HTTP client; unknown slugs are
 * ignored by the backend, so stale saved ones are sent as-is.
 */
import { z } from 'zod'

import { cursorPaginationSchema } from './common'

export const NEWS_MAX_EXCLUDED_SOURCES = 50

export const getNewsInputSchema = cursorPaginationSchema.extend({
  excludedSources: z.array(z.string()).max(NEWS_MAX_EXCLUDED_SOURCES).optional(),
})
export type GetNewsInput = z.infer<typeof getNewsInputSchema>
