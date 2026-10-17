import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getDiscoveryCollections } from '@/features/game/services/discovery'
import { DiscoveryGameCard } from '@/features/game/components/discovery-game-card'
import { getDictionary } from '@/lib/i18n'

import { LandingHeader } from './landing-header'
import { LandingFooter } from './landing-footer'

export async function DiscoveryPage() {
  const [dict, collections] = await Promise.all([getDictionary('en'), getDiscoveryCollections()])
  const t = dict.app.discovery
  const visibleCollections = collections.filter((collection) => collection.games.length > 0)

  return (
    <>
      <LandingHeader dict={dict} sectionBase="/" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pt-28 pb-20 md:gap-20 md:pt-36">
        <header className="flex max-w-3xl flex-col gap-6">
          <p className="text-sm font-medium tracking-wide text-primary">{t.eyebrow}</p>
          <h1 className="font-heading text-4xl leading-tight font-bold tracking-tight md:text-6xl">
            {t.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">{t.description}</p>
          <nav aria-label={t.collectionLabel} className="flex flex-wrap gap-3">
            {visibleCollections.map(({ id }) => (
              <Button key={id} asChild variant="outline" size="sm">
                <a href={`#${id}`}>{t.collections[id].title}</a>
              </Button>
            ))}
          </nav>
        </header>

        {visibleCollections.map(({ id, games }) => (
          <section
            key={id}
            id={id}
            aria-labelledby={`${id}-title`}
            className="flex scroll-mt-24 flex-col gap-6"
          >
            <div className="flex max-w-3xl flex-col gap-3">
              <h2 id={`${id}-title`} className="font-heading text-2xl font-semibold md:text-3xl">
                {t.collections[id].title}
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {t.collections[id].description}
              </p>
              <p className="text-sm leading-relaxed">{t.collections[id].comparison}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {games.map(({ slug, copyKey, game }) => (
                <DiscoveryGameCard
                  key={slug}
                  game={game}
                  slug={slug}
                  copy={t.games[copyKey]}
                  dict={dict}
                  locale="en"
                />
              ))}
            </div>
          </section>
        ))}

        <section
          aria-labelledby="selection-method"
          className="flex max-w-3xl flex-col gap-4 border-t border-border pt-10"
        >
          <h2 id="selection-method" className="font-heading text-2xl font-semibold">
            {t.methodTitle}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{t.methodDescription}</p>
          <p className="leading-relaxed text-muted-foreground">
            {t.dataDescription}{' '}
            <Link href="/support" className="text-foreground underline underline-offset-4">
              {t.dataLink}
            </Link>
          </p>
          <div className="pt-2">
            <Button asChild>
              <Link href="/home">
                {t.exploreApp}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter dict={dict} sectionBase="/" />
    </>
  )
}
