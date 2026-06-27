/**
 * Shared input fragments (§4, §7). Cursor pagination is reused by every list
 * endpoint: `limit` is 1..20 (backend default 20) and `cursor` is opaque.
 */
import { z } from 'zod'

export const cursorPaginationSchema = z.object({
  limit: z.number().int().min(1).max(20).optional(),
  cursor: z.string().optional(),
})
export type CursorPagination = z.infer<typeof cursorPaginationSchema>
