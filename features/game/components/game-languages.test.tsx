import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { gameLanguagesSchema } from '@/lib/domain/models/game'
import { dictionarySchema } from '@/lib/i18n/dictionary'
import en from '@/lib/i18n/dictionaries/en.json'
import es from '@/lib/i18n/dictionaries/es.json'

import { GameLanguages } from './game-languages'

const spanish = dictionarySchema.parse(es)
const english = dictionarySchema.parse(en)
const languages = (types: string[]) =>
  gameLanguagesSchema.parse(
    types.map((type) => ({ type, categories: ['AUDIO', 'SUBTITLES', 'INTERFACE'] })),
  )

test('N=0 renders no section, heading or empty placeholder', () => {
  assert.equal(
    renderToStaticMarkup(<GameLanguages dict={spanish} languages={[]} locale="es" gameId="test" />),
    '',
  )
})

test('a sole own variant renders only the card, without an empty list or action', () => {
  const html = renderToStaticMarkup(
    <GameLanguages
      dict={spanish}
      languages={languages(['SPANISH_SPAIN'])}
      locale="es"
      gameId="test"
    />,
  )
  assert.ok(html.includes('En tu idioma · Español'))
  assert.ok(html.includes('Completo'))
  assert.equal(html.includes('<ul'), false)
  assert.equal(html.includes('<button'), false)
})

test('four languages render inline without a modal trigger or table', () => {
  const html = renderToStaticMarkup(
    <GameLanguages
      dict={spanish}
      languages={languages(['SPANISH_SPAIN', 'FRENCH', 'GERMAN', 'JAPANESE'])}
      locale="es"
      gameId="test"
    />,
  )
  assert.equal((html.match(/<li /g) ?? []).length, 3)
  assert.equal(html.includes('<button'), false)
  assert.equal(html.includes('<table'), false)
})

test('five languages include a server-rendered opener, summary and previews', () => {
  const html = renderToStaticMarkup(
    <GameLanguages
      dict={spanish}
      languages={languages(['SPANISH_SPAIN', 'FRENCH', 'GERMAN', 'JAPANESE', 'ITALIAN'])}
      locale="es"
      gameId="test"
    />,
  )
  assert.ok(html.includes('Ver los 5 idiomas'))
  assert.ok(html.includes('Voces en 5 idiomas'))
  assert.ok(html.includes('Alemán'))
  assert.equal(html.includes('<table'), false)
  assert.equal(html.includes('<li '), false)
})

test('English output is determined by the explicit route locale', () => {
  const html = renderToStaticMarkup(
    <GameLanguages
      dict={english}
      languages={languages(['ENGLISH_US'])}
      locale="en"
      gameId="test"
    />,
  )
  assert.ok(html.includes('In your language · English'))
  assert.ok(html.includes('Complete'))
  assert.equal(html.includes('Español'), false)
})
