/**
 * Authed library actions for the game detail (Phase 5, Slice E). Rendered inside the
 * detail's client island (which supplies session + i18n + toaster on the otherwise
 * static SEO page).
 *
 * States from `useSession()`:
 *  - loading        → a disabled save button (no flash).
 *  - unauthenticated→ a "sign in to save" button linking into the app to authenticate.
 *  - authenticated  → the primary save button + a three-dots menu (save / whitelist /
 *                     update progress). Current saved-ness comes from `getGame()`'s
 *                     `savedInLibrary`; richer current state (status/progress) needs a
 *                     backend per-game endpoint that doesn't exist yet — hence no
 *                     "remove" action and no pre-filled progress.
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckIcon, EllipsisVerticalIcon, PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { useReportError } from '@/hooks/use-report-error'
import { useSession } from '@/features/auth'
import type { StoreGameLibraryInput } from '@/lib/domain/inputs'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { getGame } from '../services/catalog'
import { storeGameInLibrary } from '../services/library'

import { ProgressUpdateModal } from './progress-update-modal'

export function GameLibraryActions({ gameId }: { gameId: string }) {
  const dict = useDictionary()
  const t = dict.app.detail
  const report = useReportError()
  const { status } = useSession()

  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    let active = true
    getGame(gameId)
      .then((game) => {
        if (active) setSaved(game.savedInLibrary)
      })
      .catch(() => {
        // savedInLibrary is a nicety; failing to read it shouldn't block actions.
      })
    return () => {
      active = false
    }
  }, [gameId, status])

  if (status === 'loading') {
    return (
      <Button disabled className="w-fit">
        <Spinner data-icon="inline-start" />
        {t.save}
      </Button>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Button asChild className="w-fit">
        <Link href="/home">{t.signInToSave}</Link>
      </Button>
    )
  }

  async function store(input: StoreGameLibraryInput, successMsg: string) {
    setPending(true)
    try {
      await storeGameInLibrary(gameId, input)
      setSaved(true)
      toast.success(successMsg)
    } catch (e) {
      report(e)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => store({ status: 'SAVED' }, t.savedToast)} disabled={pending}>
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : saved ? (
          <CheckIcon data-icon="inline-start" />
        ) : (
          <PlusIcon data-icon="inline-start" />
        )}
        {saved ? t.saved : t.save}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label={t.moreActions}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => store({ status: 'SAVED' }, t.savedToast)}>
            {t.save}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => store({ status: 'WHITELIST' }, t.whitelistToast)}>
            {t.whitelist}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setModalOpen(true)}>
            {t.updateProgress}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {modalOpen && (
        <ProgressUpdateModal
          gameId={gameId}
          onClose={() => setModalOpen(false)}
          onUpdated={() => setSaved(true)}
        />
      )}
    </div>
  )
}
