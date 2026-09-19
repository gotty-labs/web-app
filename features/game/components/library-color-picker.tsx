'use client'

import { CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

const COLORS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#78716C',
  '#84CC16',
  '#14B8A6',
  '#F43F5E',
] as const

function colorInputValue(value: string): string {
  if (/^#[\da-f]{6}$/i.test(value)) return value
  const short = /^#([\da-f])([\da-f])([\da-f])$/i.exec(value)
  return short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : '#3B82F6'
}

export function LibraryColorPicker({
  value,
  error,
  onChange,
}: {
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  const t = useDictionary().app.library

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{t.colorLabel}</FieldLabel>
      <div className="grid grid-cols-6 gap-2">
        {COLORS.map((color) => (
          <Button
            type="button"
            size="icon"
            variant="outline"
            key={color}
            aria-label={color}
            aria-pressed={value.toUpperCase() === color}
            onClick={() => onChange(color)}
            className={cn(
              'rounded-full border-2',
              value.toUpperCase() === color ? 'border-foreground' : 'border-transparent',
            )}
            style={{ backgroundColor: color }}
          >
            {value.toUpperCase() === color ? (
              <CheckIcon className="text-white drop-shadow" />
            ) : null}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={colorInputValue(value)}
          onChange={(event) => onChange(event.target.value.toLocaleUpperCase())}
          aria-label={t.customColorLabel}
          title={t.customColorLabel}
          className="size-12 shrink-0 cursor-pointer rounded-xl p-1"
        />
        <div className="flex flex-1 flex-col gap-1">
          <FieldLabel htmlFor="library-list-color" className="text-xs">
            {t.colorHexLabel}
          </FieldLabel>
          <Input
            id="library-list-color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            maxLength={7}
            spellCheck={false}
            aria-invalid={!!error}
          />
        </div>
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
