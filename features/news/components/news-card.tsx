/**
 * A news story card: image, headline (3 lines max), source line, summary (3 lines max)
 * and, when other outlets cover it, the "Also in" button.
 *
 * The whole card body is ONE real link to the primary source's article — new tab,
 * `noopener noreferrer` so the outlet's page gets no handle on Gotty's tab, and native
 * middle-click / "open in new tab" support. Every open (click, Ctrl/⌘+click, Enter or
 * middle click) emits `news_article_opened`; the web doesn't dedupe repeated clicks.
 * The "Also in" button sits OUTSIDE the link (no nested interactive elements), so Tab
 * goes card → its "Also in" → next card.
 *
 * Outlet images come from arbitrary hosts and are linked directly (`unoptimized`):
 * they're never copied, reprocessed or served by Gotty (legal + cost constraint).
 * Without an image, or when it fails, the source logo sits on Gotty's brand color.
 */
'use client'

import { useEffect, useId, useState, type MouseEvent } from 'react'
import { ChevronRightIcon } from 'lucide-react'

import { AppImage } from '@/components/app-image'
import { Button } from '@/components/ui/button'
import type { NewsStory } from '@/lib/domain/models'
import { useDictionary, useLocale } from '@/lib/i18n/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { trackNewsArticleOpened } from '../utils/analytics'
import { formatNewsDate } from '../utils/format-date'
import { alsoInSummary, fillTemplate, isSafeArticleUrl } from '../utils/rules'

import { LanguageBadge, languageA11yLabel } from './language-badge'
import { SourceLogo } from './source-logo'

export function NewsCard({
  story,
  eager = false,
  onOpenAlsoIn,
}: {
  story: NewsStory
  /** Above-the-fold cards load their image eagerly (it's the page's LCP). */
  eager?: boolean
  onOpenAlsoIn: (story: NewsStory) => void
}) {
  const dict = useDictionary()
  const t = dict.app.news
  const locale = useLocale()
  const hintId = useId()
  const [imageFailed, setImageFailed] = useState(false)

  const { source } = story
  const safeUrl = isSafeArticleUrl(story.url)
  const date = formatNewsDate(story.publishedAt, locale, t.date)
  const imageUrl = imageFailed ? null : story.imageUrl
  const hasAlsoIn = story.alsoIn.length > 0

  useEffect(() => {
    if (!safeUrl) console.warn(`News story ${story.id} has a non-https URL; not linking it.`)
  }, [safeUrl, story.id])

  const a11yLabel = [
    `${story.title}.`,
    `${source.name}, ${date}.`,
    source.showLanguageLabel ? `${languageA11yLabel(t, source.language)}.` : null,
    story.summary,
    t.card.newTab,
  ]
    .filter(Boolean)
    .join(' ')

  function handleOpen(event: MouseEvent<HTMLAnchorElement>) {
    // `auxclick` also fires for right clicks (context menu): only the middle button opens.
    if (event.type === 'auxclick' && event.button !== 1) return
    trackNewsArticleOpened(source, false)
  }

  const body = (
    <>
      <div className="aspect-news-card bg-muted relative w-full overflow-hidden">
        {imageUrl ? (
          <AppImage
            src={imageUrl}
            alt=""
            fill
            unoptimized
            loading={eager ? 'eager' : undefined}
            sizes="(max-width: 768px) 100vw, 33vw"
            wrapperClassName="absolute inset-0"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="bg-primary absolute inset-0 flex items-center justify-center">
            <SourceLogo name={source.name} logoUrl={source.logoUrl} size={56} decorative />
          </div>
        )}
      </div>

      <div className={cn('flex flex-col gap-2 px-4 pt-3', hasAlsoIn ? 'pb-2' : 'pb-4')}>
        <h2 className="font-heading line-clamp-3 text-base leading-snug font-semibold">
          {story.title}
        </h2>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
          {/* Date + label sit right after the name. The name compresses with an ellipsis
              (capped so it never crowds them out); date + label never do — with larger
              text they wrap to a second line instead. */}
          <span className="flex max-w-[65%] min-w-0 items-center gap-1.5">
            <SourceLogo name={source.name} logoUrl={source.logoUrl} size={16} decorative />
            <span className="text-foreground truncate font-semibold">{source.name}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            <span aria-hidden>·</span>
            <span>{date}</span>
            {source.showLanguageLabel ? (
              <LanguageBadge
                t={t}
                language={source.language}
                testId={`label.news.language-badge.${story.id}`}
              />
            ) : null}
          </span>
        </div>

        <p className="text-muted-foreground line-clamp-3 text-sm">{story.summary}</p>
      </div>
    </>
  )

  return (
    <article className="bg-card text-card-foreground hover:shadow-card-hover flex min-w-0 flex-col overflow-hidden rounded-xl border transition-shadow duration-200 ease-out">
      {safeUrl ? (
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={a11yLabel}
          aria-describedby={hintId}
          data-testid={`button.news.story.${story.id}`}
          onClick={handleOpen}
          onAuxClick={handleOpen}
          className="focus-visible:ring-ring flex flex-col rounded-t-xl outline-none focus-visible:ring-2 focus-visible:ring-inset"
        >
          {body}
          <span id={hintId} className="sr-only">
            {fillTemplate(t.card.openHint, { source: source.name })}
          </span>
        </a>
      ) : (
        <div data-testid={`button.news.story.${story.id}`} className="flex flex-col">
          {body}
        </div>
      )}

      {hasAlsoIn ? <AlsoInButton story={story} onOpen={onOpenAlsoIn} /> : null}
    </article>
  )
}

function AlsoInButton({ story, onOpen }: { story: NewsStory; onOpen: (story: NewsStory) => void }) {
  const t = useDictionary().app.news
  const { names, more, allNames } = alsoInSummary(story.alsoIn)
  const label =
    more > 0
      ? fillTemplate(t.alsoIn.labelMore, { sources: names, count: more })
      : fillTemplate(t.alsoIn.label, { sources: names })

  return (
    <div className="px-4 pb-4">
      <Button
        variant="secondary"
        aria-label={fillTemplate(t.alsoIn.a11y, { sources: allNames })}
        aria-haspopup="dialog"
        data-testid={`button.news.also-in.${story.id}`}
        onClick={() => onOpen(story)}
        className="min-h-11 w-full justify-between rounded-md px-3 text-sm font-medium"
      >
        <span className="truncate">{label}</span>
        <ChevronRightIcon data-icon="inline-end" className="text-muted-foreground" />
      </Button>
    </div>
  )
}
