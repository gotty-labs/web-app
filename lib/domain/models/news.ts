/**
 * News output DTOs (`GET /news`, `GET /news/sources`). Every story arrives already
 * resolved for the user's language and source filter: the backend picks the primary
 * `source`, writes `title`/`summary` in the user's language, orders `alsoIn`, and says
 * whether each source needs its language label. Clients paint it as-is.
 *
 * A source is identified by its `slug` (stable across environments) — the value saved
 * on the device as a hidden source and sent back in `excludedSources`.
 */
import { z } from 'zod'

import { gtLanguageSchema } from '../enums'

/** A source in the catalog (`GET /news/sources`), already ordered by the backend. */
export const newsSourceSchema = z.object({
  slug: z.string(),
  name: z.string(),
  logoUrl: z.string(),
  language: gtLanguageSchema,
})
export type NewsSource = z.infer<typeof newsSourceSchema>

/** A story's primary source; its article `url`/`imageUrl` live on the story itself. */
export const newsStorySourceSchema = newsSourceSchema.extend({
  showLanguageLabel: z.boolean(),
})
export type NewsStorySource = z.infer<typeof newsStorySourceSchema>

/** Another visible outlet covering the same story ("Also in"). */
export const newsAlsoInSourceSchema = newsStorySourceSchema.extend({
  url: z.string(),
})
export type NewsAlsoInSource = z.infer<typeof newsAlsoInSourceSchema>

export const newsStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  /** First publication of the story (ISO-8601 UTC), the list's sort key. */
  publishedAt: z.string(),
  url: z.string(),
  imageUrl: z.string().nullish(),
  source: newsStorySourceSchema,
  alsoIn: z.array(newsAlsoInSourceSchema),
})
export type NewsStory = z.infer<typeof newsStorySchema>

/** Same shape as `paginated()`, but `nextCursor` may come back as `null` at the end. */
export const newsPageSchema = z.object({
  items: z.array(newsStorySchema),
  nextCursor: z
    .string()
    .nullish()
    .transform((cursor) => cursor || undefined),
})

export const newsSourcesSchema = z.object({
  sources: z.array(newsSourceSchema),
})
