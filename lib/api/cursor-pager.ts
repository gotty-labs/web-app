/**
 * Generic cursor pager (§7) — the single "load more" helper reused by every
 * paginated list (game search, filtered sections, library). Framework-agnostic;
 * a React hook can wrap it in Phase 5.
 *
 * `cursor` is opaque: we only ever send back the `nextCursor` we received.
 * `hasMore` is false once a page comes back without a `nextCursor`.
 */
import type { Paginated } from '@/lib/domain/models'

export class CursorPager<T> {
  private accumulated: T[] = []
  private cursor: string | undefined
  private started = false

  /**
   * `initialCursor` seeds the pager so the first `loadMore` continues FROM that point
   * (e.g. a feed section's `nextCursor`), rather than re-fetching page 1. Omit it to
   * page from the beginning.
   */
  constructor(
    private readonly fetchPage: (cursor: string | undefined) => Promise<Paginated<T>>,
    initialCursor?: string,
  ) {
    this.cursor = initialCursor
  }

  get items(): readonly T[] {
    return this.accumulated
  }

  get hasMore(): boolean {
    return !this.started || this.cursor !== undefined
  }

  /** Fetch the next page (or the first), append, and return the full list so far. */
  async loadMore(): Promise<readonly T[]> {
    if (!this.hasMore) return this.accumulated
    const page = await this.fetchPage(this.cursor)
    this.started = true
    this.accumulated = [...this.accumulated, ...page.items]
    this.cursor = page.nextCursor
    return this.accumulated
  }
}
