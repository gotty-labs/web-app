/**
 * Console visibility (QA Chunk 1) — a Sheet opened from the sidebar "Options" group:
 * bottom on mobile, right on desktop. The switch means VISIBLE and everything is ON by
 * default; a CTA toggles all. Persists exclusions (the non-visible ids) via
 * `setConsoleExclusions`. Each row shows the console's image from the backend.
 */
'use client'

import { Fragment, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AppImage } from '@/components/app-image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import { useReportError } from '@/hooks/use-report-error'
import { getFilterOptions } from '@/features/game'
import type { GameFilterOptions } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { setConsoleExclusions } from '../services/profile'

type Console = GameFilterOptions['consoles'][number]

export function ConsoleVisibilityModal({ onClose }: { onClose: () => void }) {
  const dict = useDictionary()
  const t = dict.app.consoleVisibility
  const report = useReportError()
  const isMobile = useIsMobile()

  const [consoles, setConsoles] = useState<Console[]>([])
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getFilterOptions()
      .then((options) => {
        if (!active) return
        setConsoles(options.consoles)
        setVisible(new Set(options.consoles.filter((c) => !c.excluded).map((c) => c.id)))
        setLoading(false)
      })
      .catch(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const allVisible = consoles.length > 0 && visible.size === consoles.length

  function toggle(id: string) {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setVisible(allVisible ? new Set() : new Set(consoles.map((c) => c.id)))
  }

  async function save() {
    setSaving(true)
    try {
      const excluded = consoles.filter((c) => !visible.has(c.id)).map((c) => c.id)
      await setConsoleExclusions({ consoleIds: excluded })
      toast.success(t.savedToast)
      onClose()
    } catch (e) {
      report(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        // Cap height only on the mobile (bottom) sheet; the desktop (right) sheet is
        // full height by default and shouldn't leave a gap.
        className={cn('flex flex-col gap-0 sm:max-w-md', isMobile && 'max-h-[85svh]')}
      >
        <SheetHeader>
          <SheetTitle>{t.title}</SheetTitle>
          <SheetDescription>{t.description}</SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-end px-4">
          <Button variant="ghost" size="sm" onClick={toggleAll} disabled={loading}>
            {allVisible ? t.hideAll : t.showAll}
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            : consoles.map((gameConsole, index) => {
                const id = `console-${gameConsole.id}`
                return (
                  <Fragment key={gameConsole.id}>
                    <div className="flex min-w-0 items-center gap-3 py-2.5">
                      <AppImage
                        src={gameConsole.media.image}
                        alt=""
                        width={40}
                        height={40}
                        wrapperClassName="size-10 shrink-0 rounded bg-transparent"
                        className="object-contain"
                      />
                      <Label htmlFor={id} className="min-w-0 flex-1 truncate font-normal">
                        {gameConsole.name}
                      </Label>
                      <Switch
                        id={id}
                        className="shrink-0"
                        checked={visible.has(gameConsole.id)}
                        onCheckedChange={() => toggle(gameConsole.id)}
                      />
                    </div>
                    {index < consoles.length - 1 ? <Separator className="bg-border/50" /> : null}
                  </Fragment>
                )
              })}
        </div>

        <SheetFooter>
          <Button onClick={save} disabled={saving || loading}>
            {saving && <Spinner data-icon="inline-start" />}
            {t.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
