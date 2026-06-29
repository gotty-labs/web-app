/**
 * Library — the user's saved games + whitelist, with progress tracking (Phase 5,
 * Slice F). Thin mount: `GameLibrary` owns the views, filters, and the progress
 * modal.
 */
import { GameLibrary } from '@/features/game'

export default function LibraryPage() {
  return <GameLibrary />
}
