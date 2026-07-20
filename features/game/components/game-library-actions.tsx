/**
 * Library actions, JustWatch-style: a horizontal row of round icon buttons with a
 * label underneath, instead of the old save button + three-dots menu. Rendered inside
 * the detail's client island (session + i18n + toaster on the otherwise-static page).
 *
 * The button SET depends on library membership (`savedInLibrary`, read WITH the token):
 *  - unauthenticated → the row is hidden entirely (no actions for signed-out visitors).
 *  - saved = false   → Save · Whitelist.
 *  - saved = true    → Remove · Lists · Progress.
 * Swapping sets re-keys the row so it animates in; each icon reacts on hover/press so
 * the active↔inactive change is felt, not just shown. Lists/Progress are placeholders
 * (a "coming soon" toast) until their flows land; Save/Whitelist/Remove hit the backend.
 */
'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  BookmarkPlusIcon,
  BookmarkXIcon,
  EyeIcon,
  GaugeIcon,
  ListPlusIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Spinner } from '@/components/ui/spinner'
import { useReportError } from '@/hooks/use-report-error'
import { useSession } from '@/features/auth'
import type { StoreGameLibraryInput } from '@/lib/domain/inputs'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { getGameForUser } from '../services/catalog'
import { removeGameFromLibrary, storeGameInLibrary } from '../services/library'

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

function ActionItem({ action, disabled, busy }: { action: Action; disabled: boolean; busy: boolean }) {
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
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    let active = true
    getGameForUser(slug)
      .then((game) => {
        if (active) setSaved(game.savedInLibrary)
      })
      .catch(() => {
        // savedInLibrary is a nicety; failing to read it shouldn't block actions.
      })
    return () => {
      active = false
    }
  }, [slug, status])

  if (status !== 'authenticated') return null

  const pending = pendingKey !== null

  async function run(key: string, task: () => Promise<void>, onDone: () => void, successMsg: string) {
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
    run(key, () => storeGameInLibrary(gameId, input), () => setSaved(true), msg)

  const comingSoon = () => toast(t.comingSoon)

  const actions: Action[] = saved
    ? [
        {
          key: 'remove',
          label: t.remove,
          tone: 'destructive',
          icon: <BookmarkXIcon />,
          onClick: () =>
            run('remove', () => removeGameFromLibrary(gameId), () => setSaved(false), t.removedToast),
        },
        { key: 'lists', label: t.lists, tone: 'default', icon: <ListPlusIcon />, onClick: comingSoon },
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
    <div
      key={saved ? 'saved' : 'unsaved'}
      className="flex flex-wrap gap-2 duration-300 animate-in fade-in-50 zoom-in-95"
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
  )
}
