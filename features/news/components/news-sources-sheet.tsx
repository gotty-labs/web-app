/**
 * News source filter (members only). Same presentation as the console visibility sheet:
 * one switch per catalog source (ON = visible), a single "Show all" / "Hide all" toggle
 * and "Save". Unlike console visibility it persists ONLY on this browser — the HIDDEN
 * catalog slugs, so a new source shows by default — and saved slugs no longer in the
 * catalog are dropped on that save.
 *
 * The catalog is fetched fresh on open (loading spinner / error with retry / empty
 * copy). "Save" is enabled only when the draft differs from what's saved, so
 * `news_sources_filtered` never fires without a real change. Closing without saving
 * discards the draft.
 */
'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useIsMobile } from '@/hooks/use-mobile'
import type { NewsSource } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { useErrorMessage } from '@/lib/i18n/hooks/use-error-message'
import { cn } from '@/lib/utils'

import { useHiddenSources } from '../hooks/use-hidden-sources'
import { useReturnFocus } from '../hooks/use-return-focus'
import { getNewsSources } from '../services/news'
import { hiddenSourcesStore } from '../stores/hidden-sources-store'
import { trackNewsSourcesFiltered } from '../utils/analytics'
import {
  allSourcesVisible,
  hiddenSourcesToSave,
  initialVisibleSources,
  isSourceDraftDirty,
  toggleAllSources,
} from '../utils/rules'

import { SourceLogo } from './source-logo'

type CatalogState =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; catalog: NewsSource[] }

export function NewsSourcesSheet({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const dict = useDictionary()
  const t = dict.app.news
  const toMessage = useErrorMessage()
  const isMobile = useIsMobile()
  const returnFocus = useReturnFocus()
  const saved = useHiddenSources()

  const [state, setState] = useState<CatalogState>({ status: 'loading' })
  const [visible, setVisible] = useState<Set<string>>(() => new Set())

  const load = useCallback(() => {
    let active = true
    getNewsSources()
      .then((catalog) => {
        if (!active) return
        setVisible(initialVisibleSources(catalog, hiddenSourcesStore.getSnapshot()))
        setState({ status: 'ready', catalog })
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', error })
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => load(), [load])

  function retry() {
    setState({ status: 'loading' })
    load()
  }

  const catalog = state.status === 'ready' ? state.catalog : []
  const allVisible = allSourcesVisible(catalog, visible)
  const dirty = state.status === 'ready' && isSourceDraftDirty(catalog, visible, saved)

  function toggle(slug: string, on: boolean) {
    setVisible((current) => {
      const next = new Set(current)
      if (on) next.add(slug)
      else next.delete(slug)
      return next
    })
  }

  function save() {
    if (!dirty) return
    const hidden = hiddenSourcesToSave(catalog, visible)
    hiddenSourcesStore.set(hidden)
    trackNewsSourcesFiltered(hidden.length)
    onClose()
    onSaved()
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
        onCloseAutoFocus={returnFocus}
        className={cn('flex flex-col gap-0 sm:max-w-md', isMobile && 'max-h-[85svh]')}
      >
        <SheetHeader>
          <SheetTitle>{t.sources.title}</SheetTitle>
          <SheetDescription>{t.sources.description}</SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-end px-4">
          <Button
            variant="ghost"
            size="sm"
            data-testid="button.news.sources.toggle-all"
            onClick={() => setVisible(toggleAllSources(catalog, visible))}
            disabled={state.status !== 'ready' || catalog.length === 0}
          >
            {allVisible ? t.sources.hideAll : t.sources.showAll}
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
          {state.status === 'loading' ? (
            <div className="flex flex-1 items-center justify-center py-12">
              <Spinner className="text-primary size-6" />
            </div>
          ) : state.status === 'error' ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{dict.app.feed.error}</EmptyTitle>
                <EmptyDescription>{toMessage(state.error)}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={retry}>
                  {dict.app.actions.retry}
                </Button>
              </EmptyContent>
            </Empty>
          ) : catalog.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">{t.sources.empty}</p>
          ) : (
            catalog.map((source, index) => {
              const id = `news-source-${source.slug}`
              const languageName = source.language === 'es' ? t.language.nameEs : t.language.nameEn
              return (
                <Fragment key={source.slug}>
                  <div className="flex min-h-15 min-w-0 items-center gap-3 py-2">
                    <SourceLogo name={source.name} logoUrl={source.logoUrl} size={32} decorative />
                    <Label
                      htmlFor={id}
                      className="flex min-w-0 flex-1 flex-col items-start gap-0.5 font-normal"
                    >
                      <span className="w-full truncate">{source.name}</span>
                      <span className="text-muted-foreground text-xs">{languageName}</span>
                    </Label>
                    <Switch
                      id={id}
                      aria-label={`${source.name}, ${languageName}`}
                      data-testid={`toggle.news.source.${source.slug}`}
                      className="shrink-0"
                      checked={visible.has(source.slug)}
                      onCheckedChange={(on) => toggle(source.slug, on)}
                    />
                  </div>
                  {index < catalog.length - 1 ? <Separator className="bg-border/50" /> : null}
                </Fragment>
              )
            })
          )}
        </div>

        <SheetFooter className="border-t">
          <Button data-testid="button.news.sources.save" onClick={save} disabled={!dirty}>
            {t.sources.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
