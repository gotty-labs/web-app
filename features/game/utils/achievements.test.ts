import assert from 'node:assert/strict'
import { test } from 'node:test'

import { gameAchievementsSchema, gameDtoSchema } from '@/lib/domain/models/game'
import { dictionarySchema } from '@/lib/i18n/dictionary'
import en from '@/lib/i18n/dictionaries/en.json'
import es from '@/lib/i18n/dictionaries/es.json'

import {
  achievementProgress,
  achievementsSummaryText,
  buildAchievementsView,
  formatAchievementRarity,
} from './achievements'

const spanish = dictionarySchema.parse(es)
const english = dictionarySchema.parse(en)

test('progress rounds half up and never shows 0 % or 100 % by rounding', () => {
  const cases: [number, number, number][] = [
    [12, 42, 29],
    [12, 49, 24],
    [1, 49, 2],
    [199, 200, 99],
    [1, 500, 1],
    [42, 42, 100],
    [0, 42, 0],
    [1, 2, 50],
  ]
  for (const [achieved, total, expected] of cases) {
    assert.equal(achievementProgress(achieved, total), expected, `${achieved}/${total}`)
  }
})

test('rarity keeps one decimal in the route language and floors at <0.1', () => {
  assert.deepEqual(
    formatAchievementRarity(62.4, 'es', spanish)?.label.replace(/\s/g, ' '),
    '62,4 %',
  )
  assert.equal(formatAchievementRarity(62.4, 'en', english)?.label, '62.4%')
  assert.equal(formatAchievementRarity(5, 'en', english)?.label, '5.0%')
  assert.equal(formatAchievementRarity(100, 'en', english)?.label, '100.0%')
  assert.equal(formatAchievementRarity(0.04, 'es', spanish)?.label, '<0,1 %')
  assert.equal(formatAchievementRarity(0.04, 'en', english)?.a11y, '<0.1% of players have it')
  assert.equal(formatAchievementRarity(62.4, 'en', english)?.a11y, '62.4% of players have it')
  assert.equal(formatAchievementRarity(null, 'en', english), null)
})

test('summary copy with and without personal progress', () => {
  assert.equal(achievementsSummaryText(english, 'en', 1, null).text, '1 achievement')
  assert.equal(achievementsSummaryText(spanish, 'es', 42, null).a11y, 'Logros de Steam: 42 logros')
  const progress = achievementsSummaryText(english, 'en', 42, 12)
  assert.equal(progress.a11y, 'Steam achievements: 12 of 42 unlocked, 29%')
  assert.equal(achievementsSummaryText(spanish, 'es', 42, 0).percent, '0 %')
})

const catalogue = gameAchievementsSchema.parse({
  source: 'STEAM',
  total: 2,
  items: [
    {
      id: 'ESCAPE_UNDERWORLD',
      name: 'No escape?',
      description: 'Escape the Underworld.',
      hidden: false,
      rarity: 62.4,
      iconUrl: 'https://cdn.example/1/a.jpg',
      iconGrayUrl: 'https://cdn.example/1/b.jpg',
    },
    {
      id: 'DEFEAT_FINAL_BOSS',
      name: 'End of the road',
      description: 'Beat the final boss.',
      hidden: true,
      rarity: 7.9,
      iconUrl: 'https://cdn.example/1/c.jpg',
      iconGrayUrl: null,
    },
  ],
})

test('the page view never carries the content of hidden achievements', () => {
  const view = buildAchievementsView(catalogue, 'en', english)
  assert.ok(view)
  assert.equal(view.total, 2)
  const serialized = JSON.stringify(view)
  for (const secret of ['DEFEAT_FINAL_BOSS', 'End of the road', 'Beat the final boss', 'c.jpg']) {
    assert.ok(!serialized.includes(secret), secret)
  }
  assert.deepEqual(view.items[1], {
    position: 2,
    hidden: true,
    rarity: { label: '7.9%', a11y: '7.9% of players have it' },
    content: null,
  })
  assert.equal(view.items[0].content?.id, 'ESCAPE_UNDERWORLD')
})

test('a detail without (or with a broken) achievements field has no block', () => {
  const base = {
    id: 'g',
    name: 'Game',
    ageRating: [],
    category: 'MAIN',
    status: 'RELEASED',
    dlcs: [],
    expansions: [],
    engines: [],
    themes: [],
    genres: [],
    companies: { develop: [], publish: [], support: [] },
    platforms: [],
    releaseDates: [],
  }
  assert.equal(gameDtoSchema.parse(base).achievements, null)
  assert.equal(gameDtoSchema.parse({ ...base, achievements: { source: 'PSN' } }).achievements, null)
  assert.equal(buildAchievementsView(null, 'en', english), null)
})
