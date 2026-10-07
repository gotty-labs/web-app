/**
 * Library actions for the game detail, rendered in the hero right under the title
 * (where the visitor is already looking) and mirrored in a compact bar pinned to the
 * top once that row scrolls away, so saving stays one click from anywhere on the page.
 * Lives inside the detail's client island (session + i18n + toaster + auth prompt on
 * the otherwise-static page).
 *
 *  - guest / no session → "Sign in to save", which opens the auth prompt (the library
 *                         is member-only, as in the native apps).
 *  - saved = false   → Save (primary) · Wishlist · Lists.
 *  - saved = true    → "Saved ▾" (Progress placeholder, Remove) · Lists.
 * Lists shows the game's membership count and opens a toggleable membership sheet.
 * The sticky bar keeps the primary action visible and folds the rest into a menu.
 */
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  BookmarkCheckIcon,
  BookmarkPlusIcon,
  BookmarkXIcon,
  CheckIcon,
  ChevronDownIcon,
  EllipsisIcon,
  EyeIcon,
  GaugeIcon,
  ListPlusIcon,
  PlusIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useReportError } from '@/hooks/use-report-error'
import { authPromptStore, useSession } from '@/features/auth'
import type { StoreGameLibraryInput } from '@/lib/domain/inputs'
import type { GameLibraryState } from '@/lib/domain/models'
import { useDictionary, useLocale } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { useScrolledPast } from '../hooks/use-scrolled-past'
import { trackGameAdded, type GameAddedMetadata } from '../utils/analytics'
import { formatCount } from '../utils/format'

import {
  createLibraryList,
  getGameLibraryState,
  removeGameFromLibrary,
  storeGameInLibrary,
  syncGameLibraryLists,
} from '../services/library'

import { CreateLibraryListSheet } from './create-library-list-sheet'
import { GameLibraryStickyBar, type StickyBarGame } from './game-library-sticky-bar'
import { LibraryListIcon } from './library-list-icon'

/** Mobile: full-width primary on its own row, the rest in two columns. Desktop: one row. */
const ROW_CLASS = 'grid grid-cols-2 gap-2 sm:flex sm:flex-wrap'

function haveSameIds(current: readonly string[], next: readonly string[]): boolean {
  if (current.length !== next.length) return false
  const currentIds = new Set(current)
  return next.every((id) => currentIds.has(id))
}

type ActionsProps = {
  game: GameAddedMetadata
  slug: string
  barGame: StickyBarGame
  scrolledPast: boolean
}

export function GameLibraryActions({
  game,
  slug,
  cover,
  rating,
}: {
  game: GameAddedMetadata
  slug: string
  cover: string
  rating?: string
}) {
  const { status } = useSession()
  // The observed wrapper stays mounted across every state so the observer never
  // watches a detached node.
  const rowRef = useRef<HTMLDivElement>(null)
  const scrolledPast = useScrolledPast(rowRef)
  const props: ActionsProps = {
    game,
    slug,
    barGame: { name: game.name, cover, rating },
    scrolledPast,
  }

  return (
    <div ref={rowRef} className="w-full max-w-sm sm:w-auto sm:max-w-none">
      {status === 'authenticated' ? (
        <SignedInLibraryActions {...props} />
      ) : status !== 'loading' ? (
        <GuestLibraryActions {...props} />
      ) : (
        // Session still hydrating: most SEO visitors are guests, so reserve their row.
        <div className={ROW_CLASS}>
          <Skeleton className="col-span-2 h-9 sm:w-28" />
        </div>
      )}
    </div>
  )
}

function GuestLibraryActions({ barGame, scrolledPast }: ActionsProps) {
  const t = useDictionary().app.detail
  const saveButton = (size: 'default' | 'lg', className?: string) => (
    <Button type="button" size={size} className={className} onClick={authPromptStore.show}>
      <BookmarkPlusIcon data-icon="inline-start" />
      {t.signInToSave}
    </Button>
  )

  return (
    <>
      <div className={ROW_CLASS}>{saveButton('lg', 'col-span-2')}</div>
      {scrolledPast ? (
        <GameLibraryStickyBar game={barGame}>{saveButton('default')}</GameLibraryStickyBar>
      ) : null}
    </>
  )
}

function SignedInLibraryActions({ game, slug, barGame, scrolledPast }: ActionsProps) {
  const gameId = game.id
  const dict = useDictionary()
  const locale = useLocale()
  const t = dict.app.detail
  const libraryT = dict.app.library
  const report = useReportError()

  const [libraryState, setLibraryState] = useState<GameLibraryState | null>(null)
  const [ready, setReady] = useState(false)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [listSheetOpen, setListSheetOpen] = useState(false)
  const [createListOpen, setCreateListOpen] = useState(false)
  const [draftGameListIds, setDraftGameListIds] = useState<string[]>([])

  useEffect(() => {
    let active = true
    getGameLibraryState(slug)
      .then((state) => {
        if (!active) return
        setLibraryState(state)
      })
      .catch(() => {
        // A failed library-state read should not show actions with an unknown state.
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [slug])

  // Wait until we know the real library state before painting the actions, so we
  // never offer "Save" for a game that's already saved.
  if (!ready) {
    return (
      <>
        <div className={ROW_CLASS}>
          <Skeleton className="col-span-2 h-9 sm:w-28" />
          <Skeleton className="h-9 sm:w-28" />
          <Skeleton className="h-9 sm:w-24" />
        </div>
        {scrolledPast ? (
          <GameLibraryStickyBar game={barGame}>
            <Skeleton className="h-8 w-24" />
          </GameLibraryStickyBar>
        ) : null}
      </>
    )
  }

  // The protected endpoint returns a state even when the game is not saved.
  if (!libraryState) return null

  const { saved, lists, gameListIds } = libraryState
  const pending = pendingKey !== null
  const listSelectionChanged = !haveSameIds(gameListIds, draftGameListIds)

  function patchLibraryState(patch: Partial<GameLibraryState>) {
    setLibraryState((current) => (current ? { ...current, ...patch } : current))
  }

  async function run(
    key: string,
    task: () => Promise<void>,
    onDone: () => void,
    successMsg: string,
  ) {
    setPendingKey(key)
    try {
      await task()
      onDone()
      toast.success(successMsg)
    } catch (e) {
      report(e)
    } finally {
      setPendingKey(null)
    }
  }

  const store = (key: string, input: StoreGameLibraryInput, msg: string) =>
    run(
      key,
      () => storeGameInLibrary(gameId, input),
      () => {
        patchLibraryState({ saved: true })
        trackGameAdded(game, key === 'whitelist' ? 'wishlist' : 'library', 'game_detail')
      },
      msg,
    )

  const openListSheet = () => {
    setDraftGameListIds(gameListIds)
    setListSheetOpen(true)
  }

  const saveLists = () => {
    if (pending || !listSelectionChanged) return
    const nextListIds = [...draftGameListIds]
    run(
      'lists',
      async () => {
        try {
          await syncGameLibraryLists(gameId, gameListIds, nextListIds)
        } catch (error) {
          try {
            const refreshed = await getGameLibraryState(slug)
            setLibraryState(refreshed)
            setDraftGameListIds(refreshed.gameListIds)
          } catch {
            // Preserve the current state if reconciliation also fails.
          }
          throw error
        }
      },
      () => {
        const addedListIds = nextListIds.filter((id) => !gameListIds.includes(id))
        patchLibraryState({
          saved: nextListIds.length > 0 ? true : saved,
          gameListIds: nextListIds,
        })
        setListSheetOpen(false)
        for (const listId of addedListIds) {
          trackGameAdded(game, 'list', 'game_detail', listId)
        }
      },
      t.listsUpdatedToast,
    )
  }

  const comingSoon = () => toast(t.comingSoon)

  const removeFromLibrary = () =>
    run(
      'remove',
      () => removeGameFromLibrary(gameId),
      () => patchLibraryState({ saved: false, gameListIds: [] }),
      t.removedToast,
    )
  const saveToLibrary = () => store('save', { status: 'SAVED' }, t.savedToast)
  const saveToWishlist = () => store('whitelist', { status: 'WHITELIST' }, t.whitelistToast)

  /** The action's icon, swapped for a spinner while that action is in flight. */
  const actionIcon = (key: string, icon: ReactNode) =>
    pendingKey === key ? <Spinner data-icon="inline-start" /> : icon

  const listCount = gameListIds.length
  const listCountLabel =
    listCount > 0
      ? (listCount === 1 ? t.inList : t.inLists).replace('{count}', formatCount(listCount, locale))
      : undefined

  const listsItem = (
    <DropdownMenuItem onSelect={openListSheet}>
      <ListPlusIcon />
      <span className="flex flex-col">
        {t.lists}
        {listCountLabel ? (
          <span className="text-xs text-muted-foreground">{listCountLabel}</span>
        ) : null}
      </span>
    </DropdownMenuItem>
  )
  const progressItem = (
    <DropdownMenuItem onSelect={comingSoon}>
      <GaugeIcon />
      {t.progressLabel}
    </DropdownMenuItem>
  )
  const removeItem = (
    <DropdownMenuItem variant="destructive" onSelect={removeFromLibrary}>
      <BookmarkXIcon />
      {t.remove}
    </DropdownMenuItem>
  )

  /** "Saved ▾": the library status doubles as the entry point to its own actions. */
  const savedMenu = (size: 'default' | 'lg', items: ReactNode) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary" size={size} disabled={pending}>
          {actionIcon('remove', <BookmarkCheckIcon data-icon="inline-start" />)}
          {t.saved}
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {items}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const row = saved ? (
    <>
      {savedMenu(
        'lg',
        <>
          <DropdownMenuGroup>{progressItem}</DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>{removeItem}</DropdownMenuGroup>
        </>,
      )}
      <ListsButton
        label={t.lists}
        countLabel={listCountLabel}
        badge={listCount > 0 ? formatCount(listCount, locale) : undefined}
        disabled={pending}
        onClick={openListSheet}
      />
    </>
  ) : (
    <>
      <Button
        type="button"
        size="lg"
        className="col-span-2"
        disabled={pending}
        onClick={saveToLibrary}
      >
        {actionIcon('save', <BookmarkPlusIcon data-icon="inline-start" />)}
        {t.save}
      </Button>
      <Button type="button" variant="outline" size="lg" disabled={pending} onClick={saveToWishlist}>
        {actionIcon('whitelist', <EyeIcon data-icon="inline-start" />)}
        {t.whitelistShort}
      </Button>
      <ListsButton
        label={t.lists}
        countLabel={listCountLabel}
        badge={listCount > 0 ? formatCount(listCount, locale) : undefined}
        disabled={pending}
        onClick={openListSheet}
      />
    </>
  )

  const barActions = saved ? (
    savedMenu(
      'default',
      <>
        <DropdownMenuGroup>
          {listsItem}
          {progressItem}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>{removeItem}</DropdownMenuGroup>
      </>,
    )
  ) : (
    <>
      <Button type="button" disabled={pending} onClick={saveToLibrary}>
        {actionIcon('save', <BookmarkPlusIcon data-icon="inline-start" />)}
        {t.save}
      </Button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={pending}
            aria-label={t.moreActions}
          >
            {pendingKey === 'whitelist' ? <Spinner /> : <EllipsisIcon />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={saveToWishlist}>
              <EyeIcon />
              {t.whitelistShort}
            </DropdownMenuItem>
            {listsItem}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  return (
    <>
      <div
        key={saved ? 'saved' : 'unsaved'}
        className={cn(ROW_CLASS, 'duration-300 animate-in fade-in-50')}
      >
        {row}
      </div>
      {scrolledPast ? (
        <GameLibraryStickyBar game={barGame}>{barActions}</GameLibraryStickyBar>
      ) : null}

      <Sheet open={listSheetOpen && !createListOpen} onOpenChange={setListSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85svh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{t.listDialogTitle}</SheetTitle>
            <SheetDescription>{t.listLibraryDisclaimer}</SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-1">
            {lists.length > 0 ? (
              <ToggleGroup
                type="multiple"
                value={draftGameListIds}
                disabled={pending}
                orientation="vertical"
                variant="filter"
                className="w-full items-stretch pb-1"
                onValueChange={setDraftGameListIds}
              >
                {lists.map((list) => {
                  const selected = draftGameListIds.includes(list.id)

                  return (
                    <ToggleGroupItem
                      key={list.id}
                      value={list.id}
                      aria-label={`${list.name}: ${selected ? libraryT.removeFromList : libraryT.addToList}`}
                      className="h-auto min-h-14 w-full min-w-0 justify-start px-3 py-2"
                    >
                      <span
                        aria-hidden
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"
                      >
                        <LibraryListIcon icon={list.icon} style={{ color: list.hexColor }} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-left">{list.name}</span>
                      {selected ? (
                        <Badge>
                          <CheckIcon data-icon="inline-start" />
                          {t.listIncluded}
                        </Badge>
                      ) : (
                        <PlusIcon aria-hidden />
                      )}
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
            ) : (
              <Empty className="min-h-40">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ListPlusIcon />
                  </EmptyMedia>
                  <EmptyTitle>{t.listEmptyTitle}</EmptyTitle>
                  <EmptyDescription>{t.listEmptyDescription}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={pending}
              onClick={() => setCreateListOpen(true)}
            >
              <PlusIcon data-icon="inline-start" />
              {libraryT.newList}
            </Button>
            <Button
              type="button"
              className="w-full"
              disabled={pending || !listSelectionChanged}
              onClick={saveLists}
            >
              {pendingKey === 'lists' ? <Spinner data-icon="inline-start" /> : null}
              {libraryT.saveChanges}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <CreateLibraryListSheet
        open={createListOpen}
        existingLists={lists}
        onOpenChange={setCreateListOpen}
        onCreate={async (input) => {
          try {
            return await createLibraryList({ ...input, gameIds: [gameId] })
          } catch (error) {
            try {
              setLibraryState(await getGameLibraryState(slug))
            } catch {
              // Preserve the current state if reconciliation also fails.
            }
            throw error
          }
        }}
        onCreated={(list) => {
          const nextGameListIds = [...gameListIds, list.id]
          setDraftGameListIds(nextGameListIds)
          patchLibraryState({
            saved: true,
            lists: [...lists, list],
            gameListIds: nextGameListIds,
          })
          trackGameAdded(game, 'list', 'game_detail', list.id)
        }}
        showGameSearch={false}
        sourceScreen="game_detail"
      />
    </>
  )
}

/** Lists entry point; the badge reports how many of the user's lists include the game. */
function ListsButton({
  label,
  countLabel,
  badge,
  disabled,
  onClick,
}: {
  label: string
  /** Spoken membership ("In 2 lists"); the visual badge only shows the number. */
  countLabel?: string
  badge?: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={disabled}
      aria-label={countLabel ? `${label}, ${countLabel}` : undefined}
      onClick={onClick}
    >
      <ListPlusIcon data-icon="inline-start" />
      {label}
      {badge ? <Badge variant="secondary">{badge}</Badge> : null}
    </Button>
  )
}
