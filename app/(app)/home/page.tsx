/**
 * Home — the Netflix-style feed (Phase 5, Slice C). A thin mount point: `GameFeed`
 * owns the data fetch, load/error/empty states, and the see-all flow. Renders only
 * once `AuthGate` reports an authenticated session (the feed is an authed call).
 */
import { GameFeed } from '@/features/game'

export default function HomePage() {
  return <GameFeed />
}
