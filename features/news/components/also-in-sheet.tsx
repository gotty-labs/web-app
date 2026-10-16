/**
 * "Read on…" outlet picker for a story covered by several sources. Same presentation as
 * the console visibility sheet (bottom on mobile, side panel on desktop). The primary
 * source comes first, then `alsoIn` in the received order; every option is a real link
 * (new tab), and activating one closes the sheet. `from_also_in` is `true` for any
 * open from here, the primary source included. Closing without choosing opens nothing;
 * Radix traps focus and returns it to the "Also in" button.
 */
'use client'

import type { MouseEvent } from 'react'
import { ExternalLinkIcon } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import type { NewsStory, NewsStorySource } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { useReturnFocus } from '../hooks/use-return-focus'
import { trackNewsArticleOpened } from '../utils/analytics'
import { isSafeArticleUrl } from '../utils/rules'

import { LanguageBadge } from './language-badge'
import { SourceLogo } from './source-logo'

type Option = NewsStorySource & { url: string }

export function AlsoInSheet({ story, onClose }: { story: NewsStory; onClose: () => void }) {
  const dict = useDictionary()
  const t = dict.app.news
  const isMobile = useIsMobile()
  const returnFocus = useReturnFocus()

  const options: Option[] = [{ ...story.source, url: story.url }, ...story.alsoIn]

  function handleOpen(event: MouseEvent<HTMLAnchorElement>, option: Option) {
    if (event.type === 'auxclick' && event.button !== 1) return
    trackNewsArticleOpened(option, true)
    onClose()
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
          <SheetTitle>{t.alsoIn.title}</SheetTitle>
          <SheetDescription>{t.alsoIn.description}</SheetDescription>
        </SheetHeader>

        <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
          {options.map((option) => {
            const content = (
              <>
                <SourceLogo name={option.name} logoUrl={option.logoUrl} size={32} decorative />
                <span className="min-w-0 flex-1 truncate font-medium">{option.name}</span>
                {/* Fixed slot so the trailing icons line up whether or not a row has a label. */}
                <span className="flex w-11 shrink-0 justify-end">
                  {option.showLanguageLabel ? (
                    <LanguageBadge t={t} language={option.language} />
                  ) : null}
                </span>
                <ExternalLinkIcon aria-hidden className="text-muted-foreground size-4 shrink-0" />
              </>
            )
            const rowClassName = 'flex min-h-14 items-center gap-3 rounded-md px-2 py-2'

            return (
              <li key={option.slug} className="border-b">
                {isSafeArticleUrl(option.url) ? (
                  <a
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`button.news.source-option.${option.slug}`}
                    onClick={(event) => handleOpen(event, option)}
                    onAuxClick={(event) => handleOpen(event, option)}
                    className={cn(
                      rowClassName,
                      'hover:bg-accent focus-visible:ring-ring outline-none focus-visible:ring-2',
                    )}
                  >
                    {content}
                    <span className="sr-only">{t.card.newTab}</span>
                  </a>
                ) : (
                  <div
                    aria-disabled
                    data-testid={`button.news.source-option.${option.slug}`}
                    className={cn(rowClassName, 'opacity-50')}
                  >
                    {content}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </SheetContent>
    </Sheet>
  )
}
