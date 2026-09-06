/**
 * Library actions, JustWatch-style: a horizontal row of round icon buttons with a
 * label underneath, instead of the old save button + three-dots menu. Rendered inside
 * the detail's client island (session + i18n + toaster on the otherwise-static page).
 *
 * The button set depends on the authenticated library state. It is omitted for
 * visitors without a session, so the row stays hidden for them.
 *  - saved = false   → Save · Whitelist · Lists.
 *  - saved = true    → Remove · Lists · Progress.
 * The Lists action is always available, reports the game's membership count, and opens a
 * toggleable membership sheet. Swapping sets re-keys the row so it animates in;
 * Progress remains a placeholder while every other action hits the backend.
 */
'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  BookmarkPlusIcon,
  BookmarkXIcon,
  CheckIcon,
  EyeIcon,
  GaugeIcon,
  ListPlusIcon,
  PlusIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { useSession } from '@/features/auth'
import type { StoreGameLibraryInput } from '@/lib/domain/inputs'
import type { GameLibraryState } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import {
  createLibraryList,
  getGameLibraryState,
  removeGameFromLibrary,
  storeGameInLibrary,
  syncGameLibraryLists,
} from '../services/library'

import { CreateLibraryListSheet } from './create-library-list-sheet'
import { LibraryListIcon } from './library-list-icon'

type Tone = 'primary' | 'default' | 'destructive'

type Action = {
  key: string
  label: string
  icon: ReactNode
  tone: Tone
  badge?: number
  onClick: () => void
}

const TONE_CLASS: Record<Tone, string> = {
  primary: 'bg-primary/15 text-primary ring-primary/30 group-hover:bg-primary/25',
  default: 'bg-muted/60 text-foreground ring-border group-hover:bg-muted',
  destructive:
    'bg-destructive/10 text-destructive ring-destructive/25 group-hover:bg-destructive/20',
}

function haveSameIds(current: readonly string[], next: readonly string[]): boolean {
  if (current.length !== next.length) return false
  const currentIds = new Set(current)
  return next.every((id) => currentIds.has(id))
}

function ActionItem({
  action,
  disabled,
  busy,
}: {
  action: Action
  disabled: boolean
  busy: boolean
}) {
  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={disabled}
      className="group flex w-16 flex-col items-center gap-2 outline-none disabled:pointer-events-none disabled:opacity-60"
    >
      <span
        className={cn(
          'relative flex size-12 items-center justify-center rounded-full ring-1 transition-all duration-200',
          'group-hover:-translate-y-0.5 group-active:scale-90 group-focus-visible:ring-2 group-focus-visible:ring-ring',
          '[&_svg]:size-5 [&_svg]:transition-transform [&_svg]:duration-200 group-hover:[&_svg]:scale-110',
          TONE_CLASS[action.tone],
        )}
      >
        {busy ? <Spinner className="size-5" /> : action.icon}
        {action.badge !== undefined ? (
          <Badge className="absolute -top-2 -right-2 min-w-5 px-1">{action.badge}</Badge>
        ) : null}
      </span>
      <span className="text-center text-xs font-medium text-muted-foreground group-hover:text-foreground">
        {action.label}
      </span>
    </button>
  )
}

export function GameLibraryActions({ gameId, slug }: { gameId: string; slug: string }) {
  const dict = useDictionary()
  const t = dict.app.detail
  const libraryT = dict.app.library
  const report = useReportError()
  const { status } = useSession()

  const [libraryState, setLibraryState] = useState<GameLibraryState | null>(null)
  const [ready, setReady] = useState(false)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [listSheetOpen, setListSheetOpen] = useState(false)
  const [createListOpen, setCreateListOpen] = useState(false)
  const [draftGameListIds, setDraftGameListIds] = useState<string[]>([])

  useEffect(() => {
    if (status !== 'authenticated') return
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
  }, [slug, status])

  // Hidden entirely for signed-out visitors; nothing to reserve while auth resolves.
  if (status !== 'authenticated') return null

  // Wait until we know the real library state before painting a button set, so we
  // never flash "Save" for a game that's already saved.
  if (!ready) {
    return (
      <div className="flex gap-2 pt-1">
        {[0, 1].map((i) => (
          <div key={i} className="flex w-16 flex-col items-center gap-2">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
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
      () => patchLibraryState({ saved: true }),
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
        patchLibraryState({
          saved: nextListIds.length > 0 ? true : saved,
          gameListIds: nextListIds,
        })
        setListSheetOpen(false)
      },
      t.listsUpdatedToast,
    )
  }

  const comingSoon = () => toast(t.comingSoon)

  const listAction: Action = {
    key: 'lists',
    label: t.lists,
    tone: 'default',
    icon: <ListPlusIcon />,
    badge: gameListIds.length,
    onClick: openListSheet,
  }

  const actions: Action[] = saved
    ? [
        {
          key: 'remove',
          label: t.remove,
          tone: 'destructive',
          icon: <BookmarkXIcon />,
          onClick: () =>
            run(
              'remove',
              () => removeGameFromLibrary(gameId),
              () => patchLibraryState({ saved: false, gameListIds: [] }),
              t.removedToast,
            ),
        },
        listAction,
        {
          key: 'progress',
          label: t.progressLabel,
          tone: 'default',
          icon: <GaugeIcon />,
          onClick: comingSoon,
        },
      ]
    : [
        {
          key: 'save',
          label: t.save,
          tone: 'primary',
          icon: <BookmarkPlusIcon />,
          onClick: () => store('save', { status: 'SAVED' }, t.savedToast),
        },
        {
          key: 'whitelist',
          label: t.whitelistShort,
          tone: 'default',
          icon: <EyeIcon />,
          onClick: () => store('whitelist', { status: 'WHITELIST' }, t.whitelistToast),
        },
        listAction,
      ]

  return (
    <>
      <div
        key={saved ? 'saved' : 'unsaved'}
        className="flex flex-wrap gap-2 pt-1 duration-300 animate-in fade-in-50"
      >
        {actions.map((action) => (
          <ActionItem
            key={action.key}
            action={action}
            disabled={pending}
            busy={pendingKey === action.key || (action.key === 'lists' && pendingKey === 'lists')}
          />
        ))}
      </div>

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
        }}
        showGameSearch={false}
      />
    </>
  )
}
