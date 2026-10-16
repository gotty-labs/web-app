/** News analytics events (names and properties identical on iOS, Android and web). */
import { track } from '@/lib/analytics'
import type { GtLanguage } from '@/lib/domain/enums'

/** Every successful load of the FIRST page (entry, retry, session change, filter save). */
export function trackNewsViewed(): void {
  track({ name: 'news_viewed' })
}

/** Right before an article opens (one per click on the web, including middle clicks). */
export function trackNewsArticleOpened(
  source: { slug: string; language: GtLanguage },
  fromAlsoIn: boolean,
): void {
  track({
    name: 'news_article_opened',
    properties: { source: source.slug, language: source.language, from_also_in: fromAlsoIn },
  })
}

/** After the source filter is saved; `hiddenCount` = hidden sources saved. */
export function trackNewsSourcesFiltered(hiddenCount: number): void {
  track({ name: 'news_sources_filtered', properties: { hidden_sources_count: hiddenCount } })
}
