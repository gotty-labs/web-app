/**
 * Search — text + console/genre-theme filters over `GET /game/filter/search`
 * (Phase 5, Slice D). Thin mount: `GameSearch` owns the filter data and the
 * paginated results.
 */
import { GameSearch } from '@/features/game'

export default function SearchPage() {
  return <GameSearch />
}
