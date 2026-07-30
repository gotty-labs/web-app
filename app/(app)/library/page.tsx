/**
 * Library — the user's saved games + whitelist, with progress tracking (Phase 5,
 * Slice F). Thin mount: `GameLibrary` owns the views, filters, and the progress
 * modal.
 */
import { GameLibrary } from '@/features/game'

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[]; listId?: string | string[] }>
}) {
  const query = await searchParams
  const mode = query.mode === 'whitelist' ? 'whitelist' : 'library'
  const listId = typeof query.listId === 'string' && mode === 'library' ? query.listId : undefined

  return <GameLibrary initialMode={mode} initialListId={listId} />
}
