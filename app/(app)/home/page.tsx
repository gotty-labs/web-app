/**
 * Home — search bar on top of the Netflix-style feed (QA Chunk 1). `GameSearch` owns
 * the search state and swaps to results when a search is active; otherwise it renders
 * the `idle` slot: the `GameFeed` carousels. (Search moved out of the sidebar to here.)
 *
 * The verify-email nudge (QA Chunk 2) is a toast raised app-wide from `VerifyEmailNudge`
 * in the `(app)` layout, so it isn't wired here.
 */
import { GameFeed, GameSearch } from '@/features/game'

export default function HomePage() {
  return <GameSearch idle={<GameFeed />} />
}
