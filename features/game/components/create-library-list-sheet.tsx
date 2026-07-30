'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { InternalCode } from '@/lib/api/error-codes'
import { ApiException } from '@/lib/api/envelope'
import { createLibraryListInputSchema, type CreateLibraryListInput } from '@/lib/domain/inputs'
import type { GameLibraryList, GameSummary } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { DEFAULT_LIBRARY_LIST_ICON, type LibraryListIcon } from '../config/library-icons'
import { useIsCompact } from '../hooks/use-is-compact'

import { LibraryColorPicker } from './library-color-picker'
import { LibraryGameSearchInput } from './library-game-search-input'
import { LibraryIconPicker } from './library-icon-picker'

const DEFAULT_COLOR = '#3B82F6'

interface FormErrors {
  name?: string
  color?: string
}

export function CreateLibraryListSheet({
  open,
  existingLists,
  onOpenChange,
  onCreate,
  onCreated,
  showGameSearch = true,
}: {
  open: boolean
  existingLists: GameLibraryList[]
  onOpenChange: (open: boolean) => void
  onCreate: (input: CreateLibraryListInput) => Promise<GameLibraryList>
  onCreated: (list: GameLibraryList) => void
  showGameSearch?: boolean
}) {
  const t = useDictionary().app.library
  const compact = useIsCompact()
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [icon, setIcon] = useState<LibraryListIcon>(DEFAULT_LIBRARY_LIST_ICON)
  const [games, setGames] = useState<GameSummary[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [pending, setPending] = useState(false)

  function reset() {
    setName('')
    setColor(DEFAULT_COLOR)
    setIcon(DEFAULT_LIBRARY_LIST_ICON)
    setGames([])
    setErrors({})
  }

  function changeOpen(next: boolean) {
    if (!next && pending) return
    if (!next) reset()
    onOpenChange(next)
  }

  function validate(): CreateLibraryListInput | null {
    const duplicate = existingLists.some(
      (list) => list.name.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
    )
    if (duplicate) {
      setErrors({ name: t.nameExists })
      return null
    }

    const result = createLibraryListInputSchema.safeParse({
      name,
      hexColor: color,
      icon,
      gameIds: showGameSearch ? games.map((game) => game.id) : [],
    })
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors
      setErrors({
        name: !name.trim() ? t.nameRequired : flattened.name ? t.nameTooLong : undefined,
        color: flattened.hexColor ? t.colorInvalid : undefined,
      })
      return null
    }
    setErrors({})
    return result.data
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = validate()
    if (!input || pending) return

    setPending(true)
    try {
      const created = await onCreate(input)
      toast.success(t.listCreatedToast)
      reset()
      onCreated(created)
      onOpenChange(false)
    } catch (error) {
      if (
        error instanceof ApiException &&
        error.internalCode === InternalCode.LIBRARY_LIST_NAME_ALREADY_EXISTS
      ) {
        setErrors((current) => ({ ...current, name: t.nameExists }))
      } else {
        toast.error(t.actionFailed)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={changeOpen}>
      <SheetContent
        side={compact ? 'bottom' : 'right'}
        className={
          compact
            ? 'h-[calc(100svh-1rem)] max-h-[calc(100svh-1rem)] rounded-t-2xl'
            : 'sm:max-w-[480px]'
        }
      >
        <SheetHeader>
          <SheetTitle>{t.newList}</SheetTitle>
          <SheetDescription>{t.newListDescription}</SheetDescription>
        </SheetHeader>

        <form
          id="create-library-list"
          onSubmit={submit}
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-4"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="library-list-name">{t.nameLabel}</FieldLabel>
              <Input
                id="library-list-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (errors.name) setErrors((current) => ({ ...current, name: undefined }))
                }}
                placeholder={t.namePlaceholder}
                maxLength={60}
                required
                autoFocus={!compact}
                aria-invalid={!!errors.name}
              />
              {errors.name ? <FieldError>{errors.name}</FieldError> : null}
            </Field>

            <LibraryColorPicker
              value={color}
              error={errors.color}
              onChange={(next) => {
                setColor(next)
                if (errors.color) setErrors((current) => ({ ...current, color: undefined }))
              }}
            />

            <LibraryIconPicker value={icon} color={color} onChange={setIcon} />

            {showGameSearch ? (
              <Field>
                <FieldLabel>{t.gameSearchLabel}</FieldLabel>
                <LibraryGameSearchInput selected={games} onSelectedChange={setGames} />
              </Field>
            ) : null}
          </FieldGroup>
        </form>

        <SheetFooter>
          <Button type="submit" form="create-library-list" disabled={!name.trim() || pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {t.createList}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
