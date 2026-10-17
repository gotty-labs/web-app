import type { Metadata } from 'next'

import { env } from '@/lib/config/env'
import { getDictionary, languageAlternates, type Locale } from '@/lib/i18n'

import { discoveryCollections } from '../config/discovery'
import { DISCOVERY_PATH, discoveryPath } from '../utils/discovery-path'
import { findPublicGame } from './seo'

export async function buildDiscoveryMetadata(locale: Locale): Promise<Metadata> {
  const {
    app: { discovery },
  } = await getDictionary(locale)
  const url = `${env.siteUrl}${discoveryPath(locale)}`
  return {
    title: discovery.title,
    description: discovery.description,
    alternates: { canonical: url, languages: languageAlternates(DISCOVERY_PATH, env.siteUrl) },
    openGraph: { title: discovery.title, description: discovery.description, url },
  }
}

/** Only public, cacheable reads. A transient failure propagates instead of caching an empty catalogue. */
export async function getDiscoveryCollections(locale: Locale) {
  return Promise.all(
    discoveryCollections.map(async (collection) => ({
      id: collection.id,
      games: (
        await Promise.all(
          collection.games.map(async (entry) => {
            const game = await findPublicGame(entry.slug, locale)
            return game ? { ...entry, game } : null
          }),
        )
      ).filter((entry) => entry !== null),
    })),
  )
}
