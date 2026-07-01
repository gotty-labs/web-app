/**
 * Console exclusions setting (Phase 5, Slice G). Lists every console from
 * `getFilterOptions()` (which carries the current `excluded` flag) with a switch to
 * hide it; Save persists the excluded ids via `setConsoleExclusions`.
 *
 * Reuses the game-domain filter options (cross-feature, public barrel) rather than
 * duplicating a consoles fetch.
 */
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useReportError } from '@/hooks/use-report-error'
import { getFilterOptions } from '@/features/game'
import type { GameFilterOptions } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { setConsoleExclusions } from '../services/profile'

type Console = GameFilterOptions['consoles'][number]

export function ConsoleExclusions() {
  const dict = useDictionary()
  const t = dict.app.settings.consoles
  const report = useReportError()

  const [consoles, setConsoles] = useState<Console[]>([])
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getFilterOptions()
      .then((options) => {
        if (!active) return
        setConsoles(options.consoles)
        setExcluded(new Set(options.consoles.filter((c) => c.excluded).map((c) => c.id)))
        setLoading(false)
      })
      .catch(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  function toggle(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function save() {
    setSaving(true)
    try {
      await setConsoleExclusions({ consoleIds: [...excluded] })
      toast.success(t.savedToast)
    } catch (e) {
      report(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)
          : consoles.map((gameConsole) => {
              const id = `console-${gameConsole.id}`
              return (
                <div key={gameConsole.id} className="flex items-center justify-between py-1.5">
                  <Label htmlFor={id} className="font-normal">
                    {gameConsole.name}
                  </Label>
                  <Switch
                    id={id}
                    checked={excluded.has(gameConsole.id)}
                    onCheckedChange={() => toggle(gameConsole.id)}
                  />
                </div>
              )
            })}
      </CardContent>
      <CardFooter>
        <Button onClick={save} disabled={saving || loading}>
          {saving && <Spinner data-icon="inline-start" />}
          {t.save}
        </Button>
      </CardFooter>
    </Card>
  )
}
