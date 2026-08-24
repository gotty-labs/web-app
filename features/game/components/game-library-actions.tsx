/**
 * Library actions, JustWatch-style: a horizontal row of round icon buttons with a
 * label underneath, instead of the old save button + three-dots menu. Rendered inside
 * the detail's client island (session + i18n + toaster on the otherwise-static page).
 *
 * The button set depends on `stored`, read WITH the token. It is omitted by the
 * public endpoint for visitors without a session, so the row stays hidden for them.
 *  - saved = false   → Save · Whitelist.
 *  - saved = true    → Remove · Lists · Progress.
 * Swapping sets re-keys the row so it animates in; each icon reacts on hover/press so
 * the active↔inactive change is felt, not just shown. Lists/Progress are placeholders
 * (a "coming soon" toast) until their flows land; Save/Whitelist/Remove and custom
 * list membership hit the backend.
 */
'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { BookmarkPlusIcon, BookmarkXIcon, EyeIcon, GaugeIcon, ListPlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useReportError } from '@/hooks/use-report-error'
import { useSession } from '@/features/auth'
import type { StoreGameLibraryInput } from '@/lib/domain/inputs'
import type { GameLibraryList, GameLibraryState } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import {
  getGameLibraryState,
  removeGameFromLibrary,
  storeGameInLibrary,
  updateLibraryList,
} from '../services/library'

type Tone = 'primary' | 'default' | 'destructive'

type Action = {
  key: string
  label: string
  icon: ReactNode
  tone: Tone
  onClick: () => void
}

const TONE_CLASS: Record<Tone, string> = {
  primary: 'bg-primary/15 text-primary ring-primary/30 group-hover:bg-primary/25',
  default: 'bg-muted/60 text-foreground ring-border group-hover:bg-muted',
  destructive:
    'bg-destructive/10 text-destructive ring-destructive/25 group-hover:bg-destructive/20',
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
          'flex size-12 items-center justify-center rounded-full ring-1 transition-all duration-200',
          'group-hover:-translate-y-0.5 group-active:scale-90 group-focus-visible:ring-2 group-focus-visible:ring-ring',
          '[&_svg]:size-5 [&_svg]:transition-transform [&_svg]:duration-200 group-hover:[&_svg]:scale-110',
          TONE_CLASS[action.tone],
        )}
      >
        {busy ? <Spinner className="size-5" /> : action.icon}
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
  const report = useReportError()
  const { status } = useSession()

  const [saved, setSaved] = useState(false)
  const [libraryState, setLibraryState] = useState<GameLibraryState | null>(null)
  const [lists, setLists] = useState<GameLibraryList[]>([])
  const [ready, setReady] = useState(false)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [listSheetOpen, setListSheetOpen] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    let active = true
    getGameLibraryState(slug)
      .then((state) => {
        if (!active) return
        setLibraryState(state)
        setSaved(state.saved)
        setLists(state.lists)
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

  const pending = pendingKey !== null

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
      () => setSaved(true),
      msg,
    )

  const openListSheet = () => {
    setListSheetOpen(true)
  }

  const saveToList = (listId: string) => {
    if (pending) return
    setListSheetOpen(false)
    run(
      'lists',
      () => updateLibraryList(listId, { gameIds: [gameId], save: true }),
      () => undefined,
      t.listSavedToast,
    )
  }

  const comingSoon = () => toast(t.comingSoon)

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
              () => setSaved(false),
              t.removedToast,
            ),
        },
        ...(lists && lists.length > 0
          ? [
              {
                key: 'lists',
                label: t.lists,
                tone: 'default' as const,
                icon: <ListPlusIcon />,
                onClick: openListSheet,
              },
            ]
          : []),
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
            busy={pendingKey === action.key}
          />
        ))}
      </div>

      <Sheet open={listSheetOpen} onOpenChange={setListSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{t.listDialogTitle}</SheetTitle>
            <SheetDescription>{t.listLibraryDisclaimer}</SheetDescription>
          </SheetHeader>

          <div className="flex max-h-[60dvh] flex-col gap-3 overflow-y-auto px-4 pb-4">
            {lists?.map((list) => (
              <Card
                key={list.id}
                size="sm"
                role="button"
                tabIndex={pending ? -1 : 0}
                aria-disabled={pending}
                className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => saveToList(list.id)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  saveToList(list.id)
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg break-all text-center text-xs leading-none"
                      style={{ backgroundColor: list.hexColor } as CSSProperties}
                    >
                      {list.icon}
                    </span>
                    <CardTitle className="truncate">{list.name}</CardTitle>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
