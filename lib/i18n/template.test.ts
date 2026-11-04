import assert from 'node:assert/strict'
import { test } from 'node:test'

import { fillTemplate } from './template'

test('fills every occurrence of a provided key', () => {
  assert.equal(fillTemplate('{a} and {a}, {b}', { a: 'x', b: 'y' }), 'x and x, y')
})

test('leaves a missing key visible instead of printing "undefined"', () => {
  assert.equal(fillTemplate('In {count} {unit}', { count: '2' }), 'In 2 {unit}')
})

test('stringifies numeric values, including zero', () => {
  assert.equal(fillTemplate('{achieved} of {total}', { achieved: 0, total: 42 }), '0 of 42')
})
