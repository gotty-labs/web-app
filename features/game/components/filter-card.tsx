'use client'

import type { Ref } from 'react'
import { Loader2Icon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { GameFilterOptions } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { ConsoleFilter } from './console-filter'
import { ContentFilter } from './content-filter'

export type FilterPanel = 'consoles' | 'content'

export function FilterCard({
  activePanel,
  options,
  optionsLoading,
  consoleIds,
  content,
  applying,
  panelRef,
  onConsoleIdsChange,
  onContentChange,
  onClose,
  onApply,
}: {
  activePanel: FilterPanel
  options: GameFilterOptions | null
  optionsLoading: boolean
  consoleIds: string[]
  content?: string
  applying: boolean
  panelRef: Ref<HTMLDivElement>
  onConsoleIdsChange: (ids: string[]) => void
  onContentChange: (value?: string) => void
  onClose: () => void
  onApply: () => void
}) {
  const t = useDictionary().app.search
  const selectedContent = [...(options?.genres ?? []), ...(options?.themes ?? [])].find(
    (item) => item.key === content,
  )?.name
  const isConsoles = activePanel === 'consoles'
  const title = isConsoles ? t.consolesPanelTitle : t.contentPanelTitle
  const description = isConsoles ? t.consolesPanelDescription : t.contentPanelDescription
  const summary = isConsoles
    ? consoleIds.length === 0
      ? t.noConsolesSelected
      : (consoleIds.length === 1 ? t.consoleSelected : t.consolesSelected).replace(
          '{count}',
          String(consoleIds.length),
        )
    : selectedContent || t.noContentSelected

  return (
    <div className="px-3 pb-3 md:px-4 md:pb-4">
      <Card
        ref={panelRef}
        id="feed-filter-panel"
        role="region"
        aria-label={title}
        className="mx-auto max-w-4xl shadow-lg"
      >
        <CardHeader>
          <CardTitle className="font-pixel text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction className="row-span-1 self-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={applying}
              aria-label={t.closePanel}
              onClick={onClose}
              className="text-foreground"
            >
              <XIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="-mb-(--card-spacing) p-0">
          <div className="max-h-(--filter-panel-max-height) overflow-y-auto overscroll-contain px-(--card-spacing) pb-8">
            <div className="relative">
              <div
                inert={!isConsoles}
                aria-hidden={!isConsoles}
                className={cn(
                  'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                  isConsoles
                    ? 'relative translate-x-0 opacity-100'
                    : 'pointer-events-none absolute inset-0 h-full overflow-hidden -translate-x-3 opacity-0',
                )}
              >
                <ConsoleFilter
                  consoles={options?.consoles ?? []}
                  loading={optionsLoading}
                  selectedIds={consoleIds}
                  onSelectedIdsChange={onConsoleIdsChange}
                  label={t.consolesPanelTitle}
                />
              </div>
              <div
                inert={isConsoles}
                aria-hidden={isConsoles}
                className={cn(
                  'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                  isConsoles
                    ? 'pointer-events-none absolute inset-0 h-full overflow-hidden translate-x-3 opacity-0'
                    : 'relative translate-x-0 opacity-100',
                )}
              >
                <ContentFilter
                  genres={options?.genres ?? []}
                  themes={options?.themes ?? []}
                  loading={optionsLoading}
                  selected={content}
                  onSelectedChange={onContentChange}
                  genresLabel={t.genres}
                  themesLabel={t.themes}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="relative z-10 justify-between gap-3 pb-[max(var(--card-spacing),env(safe-area-inset-bottom))] before:pointer-events-none before:absolute before:inset-x-0 before:-top-8 before:h-8 before:bg-linear-to-t before:from-muted/50 before:to-transparent">
          <span className="min-w-0 truncate text-sm text-muted-foreground" aria-live="polite">
            {summary}
          </span>
          <Button type="button" onClick={onApply} disabled={applying || optionsLoading}>
            {applying && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
            {t.apply}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
