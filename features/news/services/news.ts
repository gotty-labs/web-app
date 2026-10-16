/**
 * News clients (§4.0 of the news card). Both endpoints accept guest AND member
 * sessions, so they go through `authedRequest` without any client-side gating.
 */
import { authedRequest } from '@/features/auth'
import { getNewsInputSchema, type GetNewsInput } from '@/lib/domain/inputs'
import {
  newsPageSchema,
  newsSourcesSchema,
  type NewsSource,
  type NewsStory,
  type Paginated,
} from '@/lib/domain/models'

/** One page of stories, filtered and ordered by the backend. */
export function getNews(input: GetNewsInput = {}): Promise<Paginated<NewsStory>> {
  return authedRequest({
    method: 'GET',
    path: '/news',
    query: getNewsInputSchema.parse(input),
    schema: newsPageSchema,
  })
}

/** The active source catalog, already ordered (the user's language first). */
export async function getNewsSources(): Promise<NewsSource[]> {
  const { sources } = await authedRequest({
    method: 'GET',
    path: '/news/sources',
    schema: newsSourcesSchema,
  })
  return sources
}
