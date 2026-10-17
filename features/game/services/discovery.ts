import type { Metadata } from 'next'

import { env } from '@/lib/config/env'
import { getDictionary } from '@/lib/i18n'

import { discoveryCollections } from '../config/discovery'
import { DISCOVERY_PATH } from '../utils/discovery-path'
import { findPublicGame } from './seo'

export async function buildDiscoveryMetadata(): Promise<Metadata> {
  const {
    app: { discovery },
  } = await getDictionary('en')
  const url = `${env.siteUrl}${DISCOVERY_PATH}`
  return {
    title: discovery.title,
    description: discovery.description,
    alternates: { canonical: url },
    openGraph: { title: discovery.title, description: discovery.description, url },
  }
}

/** Only public, cacheable reads. A transient failure propagates instead of caching an empty catalogue. */
export async function getDiscoveryCollections() {
  return Promise.all(
    discoveryCollections.map(async (collection) => ({
      id: collection.id,
      games: (
        await Promise.all(
          collection.games.map(async (entry) => {
            const game = await findPublicGame(entry.slug, 'en')
            return game ? { ...entry, game } : null
          }),
        )
      ).filter((entry) => entry !== null),
    })),
  )
}
