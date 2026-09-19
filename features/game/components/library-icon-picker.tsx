'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import {
  LIBRARY_LIST_ICONS,
  libraryListIconSchema,
  type LibraryListIcon,
} from '../config/library-icons'

export function LibraryIconPicker({
  value,
  color,
  onChange,
}: {
  value: LibraryListIcon
  color: string
  onChange: (icon: LibraryListIcon) => void
}) {
  const t = useDictionary().app.library

  return (
    <Field>
      <FieldLabel>{t.iconLabel}</FieldLabel>
      <ScrollArea className="h-44 rounded-xl border">
        <div className="grid grid-cols-6 gap-2 p-2 pb-3">
          {libraryListIconSchema.options.map((icon) => {
            const Icon = LIBRARY_LIST_ICONS[icon]
            const selected = value === icon
            return (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                key={icon}
                title={icon}
                aria-label={icon}
                aria-pressed={selected}
                onClick={() => onChange(icon)}
                className={cn('rounded-lg border', selected ? 'bg-muted' : 'border-transparent')}
                style={{
                  borderColor: selected ? color : undefined,
                  color: selected ? color : undefined,
                }}
              >
                <Icon />
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </Field>
  )
}
