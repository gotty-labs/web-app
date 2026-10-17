import type { Dictionary } from '@/lib/i18n'

type DiscoveryCopy = Dictionary['app']['discovery']

/** Editorial choices, independent of rankings or personalised feeds. Copy lives in the dictionaries. */
export const discoveryCollections = [
  {
    id: 'unwind',
    games: [
      { slug: 'a-short-hike', copyKey: 'aShortHike' },
      { slug: 'donut-county', copyKey: 'donutCounty' },
    ],
  },
  {
    id: 'stories',
    games: [
      { slug: 'citizen-sleeper', copyKey: 'citizenSleeper' },
      { slug: 'disco-elysium', copyKey: 'discoElysium' },
    ],
  },
  {
    id: 'together',
    games: [
      { slug: 'it-takes-two', copyKey: 'itTakesTwo' },
      { slug: 'portal-2', copyKey: 'portal2' },
    ],
  },
] as const satisfies readonly {
  id: keyof DiscoveryCopy['collections']
  games: readonly { slug: string; copyKey: keyof DiscoveryCopy['games'] }[]
}[]
