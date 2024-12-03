import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { AddMediaTypeCommand } from '../../commands/application/add-media-type'
import { AddParentToMediaTypeCommand } from '../../commands/application/add-parent-to-media-type'
import { CopyTreeCommand } from '../../commands/application/copy-tree'
import { CreateTreeCommand } from '../../commands/application/create-tree'
import { MergeTreesCommand } from '../../commands/application/merge-trees'
import { RemoveMediaTypeCommand } from '../../commands/application/remove-media-type'
import { MediaTypeTreesRole } from '../../commands/domain/roles'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { GetMediaTypeTreeQuery } from './get-media-type-tree'
import { TestHelper } from './test-helper'

test('should error if no media type tree exists', async () => {
  // given
  const t = new TestHelper()
  await t.given([])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery('tree'))

  // then
  expect(result).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should return empty media type tree if no changes have been made to the tree', async () => {
  // given
  const t = new TestHelper()
  await t.given([new CreateTreeCommand('tree', 'Tree', 0, new Set([MediaTypeTreesRole.WRITE]))])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery('tree'))

  // then
  expect(result).toEqual({ name: 'Tree', mediaTypes: new Map() })
})

test('should return one media type if one has been added to the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery('tree'))

  // then
  expect(result).toEqual({
    name: 'Tree',
    mediaTypes: new Map([['media-type', { children: new Set() }]]),
  })
})

test('should return a parent-child relationship if one has been created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, roles),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, roles),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery('tree'))

  // then
  expect(result).toEqual({
    name: 'Tree',
    mediaTypes: new Map([
      ['parent', { children: new Set(['child']) }],
      ['child', { children: new Set() }],
    ]),
  })
})

test('should disclude media types that have been removed from the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
    new RemoveMediaTypeCommand('tree', 'media-type', userId, roles),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery('tree'))

  // then
  expect(result).toEqual({ name: 'Tree', mediaTypes: new Map() })
})

test('should disclude media type children that have been removed from the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, roles),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, roles),
    new RemoveMediaTypeCommand('tree', 'child', userId, roles),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery('tree'))

  // then
  expect(result).toEqual({
    name: 'Tree',
    mediaTypes: new Map([['parent', { children: new Set() }]]),
  })
})

test('should handle merged trees', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, roles),
    new AddMediaTypeCommand('source', 'mt-1', 'Media Type 1', userId, roles),
    new CreateTreeCommand('target', 'Target', userId, roles),
    new AddMediaTypeCommand('target', 'mt-2', 'Media Type 2', userId, roles),
    new MergeTreesCommand('source', 'target', userId, roles),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery('target'))

  // then
  expect(result).toEqual({
    name: 'Target',
    mediaTypes: new Map([
      ['mt-1', { children: new Set() }],
      ['mt-2', { children: new Set() }],
    ]),
  })
})

test('should handle merged trees with relationships', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('base', 'Base', userId, roles),
    new AddMediaTypeCommand('base', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('base', 'child', 'Child', userId, roles),
    new CopyTreeCommand('source', 'Source', 'base', userId, roles),
    new AddParentToMediaTypeCommand('source', 'child', 'parent', userId, roles),
    new CopyTreeCommand('target', 'Target', 'base', userId, roles),
    new MergeTreesCommand('source', 'target', userId, roles),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery('target'))

  // then
  expect(result).toEqual({
    name: 'Target',
    mediaTypes: new Map([
      ['parent', { children: new Set(['child']) }],
      ['child', { children: new Set() }],
    ]),
  })
})
