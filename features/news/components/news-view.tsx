/**
 * News screen (`/news`). Guests and members both see the list; only the source filter
 * is member-only (a guest tapping it gets the auth prompt, and has to tap again after
 * signing in — the prompt closes on its own).
 *
 * Reload rules are expressed as React keys instead of effects:
 *  - `NewsScreen` is keyed by the session (guest ↔ member, user switch), so the list
 *    AND the catalog reload from scratch on any session change;
 *  - `NewsList` is keyed by the applied exclusions, so saving the filter reloads from
 *    the first page. Exclusions apply only to members; a guest's saved filter stays
 *    on the device and comes back on the next member session.
 * Entering `/news` always mounts fresh, so there's no data cache between visits.
 */
'use client'

import { useEffect, useState } from 'react'
import { ListFilterIcon } from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { authPromptStore, useSession } from '@/features/auth'
import type { NewsSource, NewsStory } from '@/lib/domain/models'
import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

import { useHiddenSources } from '../hooks/use-hidden-sources'
import { getNewsSources } from '../services/news'
import { filterBadgeCount, fillTemplate } from '../utils/rules'

import { AlsoInSheet } from './also-in-sheet'
import { NewsList } from './news-list'
import { NewsSourcesSheet } from './news-sources-sheet'

export function NewsView() {
  const { status, user } = useSession()
  const isMember = status === 'authenticated'
  return <NewsScreen key={isMember ? `member:${user?.id ?? ''}` : 'guest'} isMember={isMember} />
}

function NewsScreen({ isMember }: { isMember: boolean }) {
  const t = useDictionary().app.news
  const hidden = useHiddenSources()
  const [catalog, setCatalog] = useState<NewsSource[] | null>(null)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [alsoInStory, setAlsoInStory] = useState<NewsStory | null>(null)

  // Requested alongside the list; it only feeds the badge and the "all hidden" empty
  // state, so a failure just leaves both out.
  useEffect(() => {
    if (!isMember) return
    let active = true
    getNewsSources()
      .then((sources) => {
        if (active) setCatalog(sources)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [isMember])

  const excludedSources = isMember ? hidden : []
  const badgeCount = filterBadgeCount({ isMember, catalog, hidden })

  function openFilter() {
    if (!isMember) {
      authPromptStore.show()
      return
    }
    setSourcesOpen(true)
  }

  return (
    <>
      <AppTopBar />
      <main data-testid="news.screen" className="flex flex-col gap-6 p-4 md:p-6">
        <header className="flex items-end gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">Gotty</p>
            <h1 className="font-heading truncate text-2xl font-semibold tracking-tight lg:text-3xl">
              {t.page.title}
            </h1>
          </div>
          <Button
            variant="outline"
            data-testid="button.news.filter"
            aria-haspopup="dialog"
            aria-label={
              badgeCount === null
                ? t.filter.label
                : fillTemplate(badgeCount === 1 ? t.filter.a11yCountOne : t.filter.a11yCountOther, {
                    count: badgeCount,
                  })
            }
            onClick={openFilter}
            // Mobile: icon only, badge on the corner. From `sm`: label + inline badge.
            className="relative size-9 shrink-0 px-0 sm:w-auto sm:gap-2 sm:px-3"
          >
            <ListFilterIcon />
            <span className="hidden sm:inline">{t.filter.label}</span>
            {badgeCount !== null ? (
              <Badge
                aria-hidden
                data-testid="label.news.filter.badge"
                className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 tabular-nums sm:static"
              >
                {badgeCount}
              </Badge>
            ) : null}
          </Button>
        </header>

        <NewsList
          key={excludedSources.join('\n')}
          excludedSources={excludedSources}
          isMember={isMember}
          catalog={catalog}
          onOpenAlsoIn={setAlsoInStory}
          onChooseSources={openFilter}
        />
      </main>

      {sourcesOpen ? (
        <NewsSourcesSheet
          onClose={() => setSourcesOpen(false)}
          onSaved={() => window.scrollTo({ top: 0 })}
        />
      ) : null}
      {alsoInStory ? (
        <AlsoInSheet story={alsoInStory} onClose={() => setAlsoInStory(null)} />
      ) : null}
    </>
  )
}
