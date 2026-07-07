/**
 * Progress update modal (Phase 5, Slice E) — sets a game's progress state and an
 * optional time played, via `storeGameInLibrary(gameId, { state, progressDuration })`.
 * Reusable: opened from the detail's three-dots menu now, and from the library cards
 * in Slice F.
 *
 * Progress state uses a `ToggleGroup` (4 options → the shadcn "2–7 options" rule),
 * labelled from the dictionary. NOTE: the current state can't be pre-filled yet —
 * there's no per-game library-state endpoint — so it defaults to NOT_STARTED.
 */
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  gameLibraryProgressStateSchema,
  type GameLibraryProgressState,
} from '@/lib/domain/enums'
import { useReportError } from '@/hooks/use-report-error'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { storeGameInLibrary } from '../services/library'
import { gameProgressStateLabel } from '../utils/labels'

export function ProgressUpdateModal({
  gameId,
  onClose,
  onUpdated,
}: {
  gameId: string
  onClose: () => void
  onUpdated?: () => void
}) {
  const dict = useDictionary()
  const t = dict.app.detail.progress
  const report = useReportError()

  const [state, setState] = useState<GameLibraryProgressState>('NOT_STARTED')
  const [duration, setDuration] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSave() {
    setPending(true)
    try {
      const minutes = duration.trim() ? Number(duration) : undefined
      await storeGameInLibrary(gameId, {
        state,
        progressDuration: typeof minutes === 'number' && Number.isFinite(minutes) ? minutes : undefined,
      })
      toast.success(t.updatedToast)
      onUpdated?.()
      onClose()
    } catch (e) {
      report(e)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <ToggleGroup
              type="single"
              value={state}
              onValueChange={(value) => {
                if (value) setState(value as GameLibraryProgressState)
              }}
              variant="outline"
              className="flex-wrap justify-start"
            >
              {gameLibraryProgressStateSchema.options.map((option) => (
                <ToggleGroupItem key={option} value={option}>
                  {gameProgressStateLabel(dict, option)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="progress-duration">{t.durationLabel}</FieldLabel>
            <Input
              id="progress-duration"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={t.durationPlaceholder}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {dict.app.actions.cancel}
          </Button>
          <Button onClick={handleSave} disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
