'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { AppTopBar } from '@/components/app-top-bar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import type { GameLibraryProgressState, UserGameLibraryStatus } from '@/lib/domain/enums'
import type { GameLibrary, GameLibraryList } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { useLibrary } from '../hooks/use-library'
import { useLibraryLists } from '../hooks/use-library-lists'
import {
  removeGameFromLibrary,
  storeGameInLibrary,
  syncGameLibraryLists,
  updateLibraryList,
} from '../services/library'

import { CreateLibraryListSheet } from './create-library-list-sheet'
import { LibraryGameActionsSheet } from './library-game-actions-sheet'
import { LibraryGameGrid } from './library-game-grid'
import { LibraryHeader } from './library-header'
import { LibraryListSelector } from './library-list-selector'

type ViewMode = 'library' | 'whitelist'
type RemoveKind = 'library' | 'whitelist' | 'list'
type CreateListOrigin = 'library' | 'game-actions'

function statusForMode(mode: ViewMode): UserGameLibraryStatus {
  return mode === 'whitelist' ? 'WHITELIST' : 'SAVED'
}

function modeForStatus(status: UserGameLibraryStatus): ViewMode {
  return status === 'WHITELIST' ? 'whitelist' : 'library'
}

export function GameLibrary({
  initialMode = 'library',
  initialListId,
}: {
  initialMode?: ViewMode
  initialListId?: string
}) {
  const router = useRouter()
  const dict = useDictionary()
  const t = dict.app.library
  const initialStatus = statusForMode(initialMode)
  const { items, loading, error, hasMore, criteria, apply, loadMore, reload } = useLibrary({
    status: initialStatus,
    listId: initialStatus === 'SAVED' ? initialListId : undefined,
  })
  const {
    lists,
    loading: listsLoading,
    create,
    remove: deleteList,
    refresh: refreshLists,
  } = useLibraryLists()

  const [createOpen, setCreateOpen] = useState(false)
  const [createListOrigin, setCreateListOrigin] = useState<CreateListOrigin>('library')
  const [listToDelete, setListToDelete] = useState<GameLibraryList | null>(null)
  const [deleteListPending, setDeleteListPending] = useState(false)
  const [activeGame, setActiveGame] = useState<GameLibrary | null>(null)
  const pendingIdsRef = useRef(new Set<string>())
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set())
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set())
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set())
  const [progressOverrides, setProgressOverrides] = useState<Map<string, GameLibrary['progress']>>(
    () => new Map(),
  )
  const [listOverrides, setListOverrides] = useState<Map<string, GameLibrary['lists']>>(
    () => new Map(),
  )

  const mode = modeForStatus(criteria.status)
  const games = useMemo(
    () =>
      items
        .filter((game) => !hiddenIds.has(game.id))
        .map((game) => {
          const progress = progressOverrides.get(game.id)
          const lists = listOverrides.get(game.id) ?? game.lists
          return progress || lists !== game.lists
            ? { ...game, progress: progress ?? game.progress, lists }
            : game
        }),
    [items, hiddenIds, progressOverrides, listOverrides],
  )

  function replaceUrl(nextMode: ViewMode, listId?: string) {
    const params = new URLSearchParams()
    if (nextMode === 'whitelist') params.set('mode', 'whitelist')
    if (nextMode === 'library' && listId) params.set('listId', listId)
    const query = params.toString()
    router.replace(query ? `/library?${query}` : '/library', { scroll: false })
  }

  function clearTransientState() {
    setActiveGame(null)
    pendingIdsRef.current = new Set()
    setPendingIds(new Set())
    setRemovingIds(new Set())
    setHiddenIds(new Set())
    setProgressOverrides(new Map())
    setListOverrides(new Map())
  }

  function changeStatus(status: UserGameLibraryStatus) {
    if (status === criteria.status && !criteria.listId) return
    clearTransientState()
    apply({ status })
    replaceUrl(modeForStatus(status))
  }

  function changeList(listId?: string) {
    if (criteria.status === 'SAVED' && criteria.listId === listId) return
    clearTransientState()
    apply({ status: 'SAVED', listId })
    replaceUrl('library', listId)
  }

  function setPending(gameId: string, value: boolean) {
    const latest = new Set(pendingIdsRef.current)
    if (value) latest.add(gameId)
    else latest.delete(gameId)
    pendingIdsRef.current = latest

    setPendingIds((current) => {
      const next = new Set(current)
      if (value) next.add(gameId)
      else next.delete(gameId)
      return next
    })
  }

  function setRemoving(gameId: string, value: boolean) {
    setRemovingIds((current) => {
      const next = new Set(current)
      if (value) next.add(gameId)
      else next.delete(gameId)
      return next
    })
  }

  function setHidden(gameId: string, value: boolean) {
    setHiddenIds((current) => {
      const next = new Set(current)
      if (value) next.add(gameId)
      else next.delete(gameId)
      return next
    })
  }

  async function optimisticRemove(
    game: GameLibrary,
    request: () => Promise<void>,
    message: string,
  ) {
    if (pendingIdsRef.current.has(game.id)) return false
    setPending(game.id, true)
    setRemoving(game.id, true)
    const hideTimer = setTimeout(() => setHidden(game.id, true), 180)

    try {
      await request()
      toast.success(message)
      return true
    } catch {
      clearTimeout(hideTimer)
      setRemoving(game.id, false)
      setHidden(game.id, false)
      toast.error(t.actionFailed)
      return false
    } finally {
      setPending(game.id, false)
    }
  }

  async function remove(game: GameLibrary, kind: RemoveKind): Promise<boolean> {
    if (kind === 'list' && criteria.listId) {
      const selectedListId = criteria.listId
      const result = await optimisticRemove(
        game,
        () => updateLibraryList(selectedListId, { gameIds: [game.id], save: false }),
        t.removedFromListToast,
      )
      if (result) void refreshLists()
      return result
    }
    return optimisticRemove(
      game,
      () => removeGameFromLibrary(game.id),
      kind === 'whitelist' ? t.removedWhitelistToast : t.removedToast,
    )
  }

  async function addToLibrary(game: GameLibrary): Promise<boolean> {
    return optimisticRemove(
      game,
      () => storeGameInLibrary(game.id, { status: 'SAVED' }),
      t.addedToast,
    )
  }

  async function updateProgress(
    game: GameLibrary,
    state: GameLibraryProgressState,
    durationMinutes: number,
  ): Promise<boolean> {
    if (pendingIdsRef.current.has(game.id)) return false
    setPending(game.id, true)
    const previous = progressOverrides.get(game.id)
    setProgressOverrides((current) => {
      const next = new Map(current)
      next.set(game.id, { ...game.progress, state, duration: durationMinutes })
      return next
    })
    try {
      await storeGameInLibrary(game.id, { state, progressDuration: durationMinutes })
      toast.success(t.saveChanges)
      return true
    } catch {
      setProgressOverrides((current) => {
        const next = new Map(current)
        if (previous) next.set(game.id, previous)
        else next.delete(game.id)
        return next
      })
      toast.error(t.actionFailed)
      return false
    } finally {
      setPending(game.id, false)
    }
  }

  async function updateLists(game: GameLibrary, nextListIds: string[]): Promise<boolean> {
    if (pendingIdsRef.current.has(game.id)) return false
    setPending(game.id, true)
    try {
      await syncGameLibraryLists(
        game.id,
        game.lists.map((list) => list.id),
        nextListIds,
      )
      setListOverrides((current) => {
        const next = new Map(current)
        next.set(
          game.id,
          lists
            .filter((list) => nextListIds.includes(list.id))
            .map(({ id, icon, hexColor }) => ({ id, icon, hexColor })),
        )
        return next
      })
      if (
        (criteria.status === 'WHITELIST' && nextListIds.length > 0) ||
        (criteria.listId && !nextListIds.includes(criteria.listId))
      ) {
        setRemoving(game.id, true)
        setTimeout(() => setHidden(game.id, true), 180)
      }
      void refreshLists()
      toast.success(t.listsUpdatedToast)
      return true
    } catch {
      reload()
      void refreshLists()
      toast.error(t.actionFailed)
      return false
    } finally {
      setPending(game.id, false)
    }
  }

  function openCreateList(origin: CreateListOrigin) {
    setCreateListOrigin(origin)
    setCreateOpen(true)
  }

  function changeCreateOpen(open: boolean) {
    setCreateOpen(open)
    if (!open) setCreateListOrigin('library')
  }

  function handleCreatedList(list: GameLibraryList) {
    if (createListOrigin === 'library') {
      changeList(list.id)
      return
    }
    if (!activeGame) return

    setListOverrides((current) => {
      const next = new Map(current)
      next.set(activeGame.id, [
        ...activeGame.lists,
        { id: list.id, icon: list.icon, hexColor: list.hexColor },
      ])
      return next
    })
    if (criteria.status === 'WHITELIST') {
      setRemoving(activeGame.id, true)
      setTimeout(() => setHidden(activeGame.id, true), 180)
    }
    void refreshLists()
    setActiveGame(null)
  }

  async function confirmDeleteList() {
    if (!listToDelete || deleteListPending) return
    const list = listToDelete
    setDeleteListPending(true)
    try {
      await deleteList(list.id)
      if (criteria.listId === list.id) changeList(undefined)
      setListToDelete(null)
      toast.success(t.listDeletedToast)
    } catch {
      toast.error(t.actionFailed)
    } finally {
      setDeleteListPending(false)
    }
  }

  return (
    <>
      <AppTopBar />
      <main className="flex flex-col gap-6 p-4 md:p-6">
        <LibraryHeader
          status={criteria.status}
          loading={loading || (items.length === 0 && hasMore && !error)}
          onStatusChange={changeStatus}
        />

        {mode === 'library' ? (
          <LibraryListSelector
            lists={lists}
            selectedListId={criteria.listId}
            loading={listsLoading}
            onSelect={changeList}
            onCreate={() => openCreateList('library')}
            onDelete={setListToDelete}
          />
        ) : null}

        <LibraryGameGrid
          games={games}
          mode={mode}
          selectedListId={criteria.listId}
          loading={loading}
          error={error}
          hasMore={hasMore}
          pendingIds={pendingIds}
          removingIds={removingIds}
          onLoadMore={loadMore}
          onOpenActions={setActiveGame}
        />
      </main>

      <CreateLibraryListSheet
        open={createOpen}
        existingLists={lists}
        onOpenChange={changeCreateOpen}
        onCreate={(input) =>
          createListOrigin === 'game-actions' && activeGame
            ? create({ ...input, gameIds: [activeGame.id] })
            : create(input)
        }
        onCreated={handleCreatedList}
        showGameSearch={createListOrigin === 'library'}
      />

      {activeGame ? (
        <LibraryGameActionsSheet
          game={games.find((game) => game.id === activeGame.id) ?? activeGame}
          mode={mode}
          selectedListId={criteria.listId}
          lists={lists}
          open={!createOpen}
          pending={pendingIds.has(activeGame.id)}
          onOpenChange={(open) => {
            if (!open) setActiveGame(null)
          }}
          onCreateList={() => openCreateList('game-actions')}
          onRemove={(kind) => remove(activeGame, kind)}
          onAddToLibrary={() => addToLibrary(activeGame)}
          onUpdateProgress={(state, duration) => updateProgress(activeGame, state, duration)}
          onUpdateLists={(listIds) => updateLists(activeGame, listIds)}
        />
      ) : null}

      <AlertDialog
        open={listToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteListPending) setListToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteListTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteListDescription.replace('{list}', listToDelete?.name ?? '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteListPending}>
              {dict.app.actions.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteListPending}
              onClick={(event) => {
                event.preventDefault()
                void confirmDeleteList()
              }}
            >
              {deleteListPending ? <Spinner data-icon="inline-start" /> : null}
              {t.deleteList}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
