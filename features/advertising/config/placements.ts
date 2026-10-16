export const adPlacement = {
  feed: 'feed',
  paginatedSection: 'paginated-section',
  sidebar: 'sidebar',
  gameDetail: 'game-detail',
} as const

export type AdPlacement = (typeof adPlacement)[keyof typeof adPlacement]

/** One card-sized unit after each block, capped so ads never dominate a carousel. */
export const FEED_GAMES_PER_AD = 5
export const MAX_FEED_ADS = 2

/** News grid: one card-sized unit after every 6 stories (two full rows at 3 columns). */
export const NEWS_STORIES_PER_AD = 6
