'use client'

import { useState } from 'react'
import {
  BookOpenIcon,
  ChartNoAxesColumnIncreasingIcon,
  ChevronLeftIcon,
  FolderPlusIcon,
  LibraryBigIcon,
  ListMinusIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import Link from 'next/link'

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
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { gameLibraryProgressStateSchema, type GameLibraryProgressState } from '@/lib/domain/enums'
import type { GameLibrary, GameLibraryList } from '@/lib/domain/models'
import { useDictionary, useLocale } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { progressStateToggleClass } from '../config/progress-state-styles'
import { useIsCompact } from '../hooks/use-is-compact'
import { timeToBeatHours } from '../utils/format'
import { gameProgressStateLabel } from '../utils/labels'
import { gamePath } from '../utils/paths'

import { LibraryListIcon } from './library-list-icon'
import { DEFAULT_MAX_TIME_TO_BEAT } from '../constants/default-max-time-to-beast.const'

type Panel = 'menu' | 'progress' | 'lists'
type RemoveKind = 'library' | 'whitelist' | 'list'

function interpolate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (copy, [key, value]) => copy.replaceAll(`{${key}}`, value),
    template,
  )
}

export function LibraryGameActionsSheet({
  game,
  mode,
  selectedListId,
  lists,
  open,
  pending,
  onOpenChange,
  onCreateList,
  onRemove,
  onAddToLibrary,
  onUpdateProgress,
  onUpdateLists,
}: {
  game: GameLibrary
  mode: 'library' | 'whitelist'
  selectedListId?: string
  lists: GameLibraryList[]
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onCreateList: () => void
  onRemove: (kind: RemoveKind) => Promise<boolean>
  onAddToLibrary: () => Promise<boolean>
  onUpdateProgress: (state: GameLibraryProgressState, durationMinutes: number) => Promise<boolean>
  onUpdateLists: (listIds: string[]) => Promise<boolean>
}) {
  const dict = useDictionary()
  const t = dict.app.library
  const locale = useLocale()
  const compact = useIsCompact()
  const currentHours = (game.progress.duration ?? 0) / 60
  const suggestedMax = game.timeToBeat?.total
    ? timeToBeatHours(game.timeToBeat.total)
    : DEFAULT_MAX_TIME_TO_BEAT
  const maxHours = Math.max(0.5, Math.ceil(Math.max(suggestedMax, currentHours) * 2) / 2)
  const currentListIds = game.lists.map((list) => list.id)

  const [panel, setPanel] = useState<Panel>('menu')
  const [state, setState] = useState<GameLibraryProgressState>(game.progress.state)
  const [hours, setHours] = useState(Math.min(currentHours, maxHours))
  const [listIds, setListIds] = useState<string[]>(currentListIds)
  const [removeKind, setRemoveKind] = useState<RemoveKind | null>(null)
  const listSelectionChanged =
    listIds.length !== currentListIds.length ||
    listIds.some((listId) => !currentListIds.includes(listId))

  function changeOpen(next: boolean) {
    if (!next) setPanel('menu')
    onOpenChange(next)
  }

  async function run(action: () => Promise<boolean>) {
    if (await action()) changeOpen(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={changeOpen}>
        <SheetContent
          side={compact ? 'bottom' : 'right'}
          className={compact ? 'max-h-[92svh] rounded-t-2xl' : 'sm:max-w-md'}
        >
          <SheetHeader>
            <div className="flex items-center gap-2">
              {panel !== 'menu' ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={dict.app.actions.back}
                  onClick={() => setPanel('menu')}
                >
                  <ChevronLeftIcon />
                </Button>
              ) : null}
              <div className="min-w-0">
                <SheetTitle className="truncate">{game.name}</SheetTitle>
                <SheetDescription>
                  {panel === 'menu'
                    ? t.actionsTitle
                    : panel === 'progress'
                      ? t.updateProgress
                      : t.addToList}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {panel === 'menu' ? (
            <div className="flex flex-col gap-1 px-4 pb-4">
              {game.slug ? (
                <Button asChild variant="ghost" className="justify-start">
                  <Link
                    href={gamePath(game.slug, locale)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BookOpenIcon data-icon="inline-start" />
                    {t.moreInfo}
                  </Link>
                </Button>
              ) : null}

              {mode === 'library' ? (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setPanel('progress')}
                  >
                    <ChartNoAxesColumnIncreasingIcon data-icon="inline-start" />
                    {t.updateProgress}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setPanel('lists')}
                  >
                    <FolderPlusIcon data-icon="inline-start" />
                    {t.addToList}
                  </Button>
                  {selectedListId ? (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      disabled={pending}
                      onClick={() => setRemoveKind('list')}
                    >
                      <ListMinusIcon data-icon="inline-start" />
                      {t.removeFromList}
                    </Button>
                  ) : null}
                  <Button
                    variant="destructive"
                    className="justify-start"
                    disabled={pending}
                    onClick={() => setRemoveKind('library')}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    {t.removeFromLibrary}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setPanel('lists')}
                  >
                    <FolderPlusIcon data-icon="inline-start" />
                    {t.addToList}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    disabled={pending}
                    onClick={() => void run(onAddToLibrary)}
                  >
                    {pending ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <LibraryBigIcon data-icon="inline-start" />
                    )}
                    {t.addToLibrary}
                  </Button>
                  <Button
                    variant="destructive"
                    className="justify-start"
                    disabled={pending}
                    onClick={() => setRemoveKind('whitelist')}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    {t.removeFromWhitelist}
                  </Button>
                </>
              )}
            </div>
          ) : null}

          {panel === 'progress' ? (
            <>
              <FieldGroup className="px-4 pb-4">
                <Field>
                  <FieldLabel>{t.progressStateLabel}</FieldLabel>
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
                      <ToggleGroupItem
                        key={option}
                        value={option}
                        className={cn('font-semibold', progressStateToggleClass[option])}
                      >
                        {gameProgressStateLabel(dict, option)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
                <Field>
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel>{t.progressDurationLabel}</FieldLabel>
                    <output className="text-primary text-sm font-semibold">
                      {hours.toLocaleString(locale, { maximumFractionDigits: 1 })} h
                    </output>
                  </div>
                  <div className="relative py-2">
                    <div className="pointer-events-none absolute inset-x-2 top-1/2 h-2 -translate-y-1/2">
                      {Array.from({ length: Math.max(0, Math.floor(maxHours / 10) - 1) }).map(
                        (_, index) => (
                          <span
                            key={index}
                            className="bg-muted-foreground/30 absolute top-0 h-2 w-px"
                            style={{ left: `${((index + 1) * 10 * 100) / maxHours}%` }}
                          />
                        ),
                      )}
                    </div>
                    <Slider
                      min={0}
                      max={maxHours}
                      step={0.5}
                      value={[hours]}
                      onValueChange={(value) => setHours(value[0] ?? 0)}
                      aria-label={t.progressDurationLabel}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {interpolate(t.progressDurationHint, {
                      hours: maxHours.toLocaleString(locale, { maximumFractionDigits: 1 }),
                    })}
                  </p>
                </Field>
              </FieldGroup>
              <SheetFooter>
                <Button
                  disabled={pending}
                  onClick={() => void run(() => onUpdateProgress(state, Math.round(hours * 60)))}
                >
                  {pending ? <Spinner data-icon="inline-start" /> : null}
                  {t.saveChanges}
                </Button>
              </SheetFooter>
            </>
          ) : null}

          {panel === 'lists' ? (
            <>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
                <Field>
                  <FieldLabel>{t.listChoiceLabel}</FieldLabel>
                  {lists.length > 0 ? (
                    <ToggleGroup
                      type="multiple"
                      value={listIds}
                      disabled={pending}
                      onValueChange={setListIds}
                      variant="outline"
                      orientation="vertical"
                      className="w-full items-stretch"
                    >
                      {lists.map((list) => {
                        const selected = listIds.includes(list.id)

                        return (
                          <ToggleGroupItem
                            key={list.id}
                            value={list.id}
                            title={list.name}
                            className="w-full min-w-0 justify-start overflow-hidden"
                            style={{
                              borderColor: selected ? list.hexColor : undefined,
                              backgroundColor: selected ? `${list.hexColor}1A` : undefined,
                            }}
                          >
                            <span
                              aria-hidden
                              className="size-2.5 shrink-0 rounded-full border"
                              style={{
                                backgroundColor: list.hexColor,
                                borderColor: list.hexColor,
                              }}
                            />
                            <LibraryListIcon icon={list.icon} className="shrink-0" />
                            <span className="min-w-0 flex-1 truncate text-left">{list.name}</span>
                          </ToggleGroupItem>
                        )
                      })}
                    </ToggleGroup>
                  ) : (
                    <Button variant="outline" onClick={onCreateList}>
                      <PlusIcon data-icon="inline-start" />
                      {t.newList}
                    </Button>
                  )}
                  {lists.length > 0 ? (
                    <Button variant="outline" className="justify-start" onClick={onCreateList}>
                      <PlusIcon data-icon="inline-start" />
                      {t.newList}
                    </Button>
                  ) : null}
                </Field>
              </div>
              <SheetFooter>
                <Button
                  disabled={pending || !listSelectionChanged}
                  onClick={() => void run(() => onUpdateLists(listIds))}
                >
                  {pending ? <Spinner data-icon="inline-start" /> : null}
                  {t.saveChanges}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={removeKind !== null}
        onOpenChange={(next) => {
          if (!next) setRemoveKind(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmRemoveTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {interpolate(
                removeKind === 'list' ? t.confirmRemoveListDescription : t.confirmRemoveDescription,
                { game: game.name },
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dict.app.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => {
                if (removeKind) void run(() => onRemove(removeKind))
              }}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {t.confirmRemove}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
