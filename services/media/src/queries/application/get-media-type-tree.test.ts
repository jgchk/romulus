import { expect } from 'vitest'

import {
  MediaTypeAddedEvent,
  MediaTypeRemovedEvent,
  MediaTypeTreeCreatedEvent,
  MediaTypeTreesMergedEvent,
  ParentAddedToMediaTypeEvent,
} from '../../shared/domain/events'
import { test } from '../../vitest-setup'
import { GetMediaTypeTreeQuery } from './get-media-type-tree'

const uuid = () => crypto.randomUUID()

test('should error if no media type tree exists', async ({ t }) => {
  // given
  const treeId = uuid()
  await t.given([])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery(treeId))

  // then
  expect(result).toBeUndefined()
})

test('should return empty media type tree if no changes have been made to the tree', async ({
  t,
}) => {
  // given
  const treeId = uuid()
  await t.given([new MediaTypeTreeCreatedEvent(treeId, 'Tree', undefined, 0)])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery(treeId))

  // then
  expect(result).toEqual({ name: 'Tree', mediaTypes: new Map() })
})

test('should return one media type if one has been added to the tree', async ({ t }) => {
  // given
  const treeId = uuid()
  const mediaTypeId = uuid()
  await t.given([
    new MediaTypeTreeCreatedEvent(treeId, 'Tree', undefined, 0),
    new MediaTypeAddedEvent(treeId, mediaTypeId, 'Media Type', 'commit-1'),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery(treeId))

  // then
  expect(result).toEqual({
    name: 'Tree',
    mediaTypes: new Map([[mediaTypeId, { children: new Set() }]]),
  })
})

test('should return a parent-child relationship if one has been created', async ({ t }) => {
  // given
  const treeId = uuid()
  const parentId = uuid()
  const childId = uuid()
  await t.given([
    new MediaTypeTreeCreatedEvent(treeId, 'Tree', undefined, 0),
    new MediaTypeAddedEvent(treeId, parentId, 'Parent', 'commit-1'),
    new MediaTypeAddedEvent(treeId, childId, 'Child', 'commit-2'),
    new ParentAddedToMediaTypeEvent(treeId, childId, parentId, 'commit-3'),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery(treeId))

  // then
  expect(result).toEqual({
    name: 'Tree',
    mediaTypes: new Map([
      [parentId, { children: new Set([childId]) }],
      [childId, { children: new Set() }],
    ]),
  })
})

test('should disclude media types that have been removed from the tree', async ({ t }) => {
  // given
  const treeId = uuid()
  const mediaTypeId = uuid()
  await t.given([
    new MediaTypeTreeCreatedEvent(treeId, 'Tree', undefined, 0),
    new MediaTypeAddedEvent(treeId, mediaTypeId, 'Media Type', 'commit-1'),
    new MediaTypeRemovedEvent(treeId, mediaTypeId, 'commit-2'),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery(treeId))

  // then
  expect(result).toEqual({ name: 'Tree', mediaTypes: new Map() })
})

test('should disclude media type children that have been removed from the tree', async ({ t }) => {
  // given
  const treeId = uuid()
  const parentId = uuid()
  const childId = uuid()
  await t.given([
    new MediaTypeTreeCreatedEvent(treeId, 'Tree', undefined, 0),
    new MediaTypeAddedEvent(treeId, parentId, 'Parent', 'commit-1'),
    new MediaTypeAddedEvent(treeId, childId, 'Child', 'commit-2'),
    new ParentAddedToMediaTypeEvent(treeId, childId, parentId, 'commit-3'),
    new MediaTypeRemovedEvent(treeId, childId, 'commit-4'),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery(treeId))

  // then
  expect(result).toEqual({
    name: 'Tree',
    mediaTypes: new Map([[parentId, { children: new Set() }]]),
  })
})

test('should handle merged trees', async ({ t }) => {
  // given
  const sourceId = uuid()
  const targetId = uuid()
  const mediaType1Id = uuid()
  const mediaType2Id = uuid()
  await t.given([
    new MediaTypeTreeCreatedEvent(sourceId, 'Source', undefined, 0),
    new MediaTypeAddedEvent(sourceId, mediaType1Id, 'Media Type 1', 'commit-1'),
    new MediaTypeTreeCreatedEvent(targetId, 'Target', undefined, 0),
    new MediaTypeAddedEvent(targetId, mediaType2Id, 'Media Type 2', 'commit-2'),
    new MediaTypeTreesMergedEvent(sourceId, targetId, 'commit-3'),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery(targetId))

  // then
  expect(result).toEqual({
    name: 'Target',
    mediaTypes: new Map([
      [mediaType1Id, { children: new Set() }],
      [mediaType2Id, { children: new Set() }],
    ]),
  })
})

test('should handle merged trees with relationships', async ({ t }) => {
  // given
  const baseId = uuid()
  const sourceId = uuid()
  const targetId = uuid()
  const parentId = uuid()
  const childId = uuid()
  await t.given([
    new MediaTypeTreeCreatedEvent(baseId, 'Base', undefined, 0),
    new MediaTypeAddedEvent(baseId, parentId, 'Parent', 'commit-1'),
    new MediaTypeAddedEvent(baseId, childId, 'Child', 'commit-2'),
    new MediaTypeTreeCreatedEvent(sourceId, 'Source', baseId, 0),
    new ParentAddedToMediaTypeEvent(sourceId, childId, parentId, 'commit-3'),
    new MediaTypeTreeCreatedEvent(targetId, 'Target', baseId, 0),
    new MediaTypeTreesMergedEvent(sourceId, targetId, 'commit-4'),
  ])

  // when
  const result = await t.when(new GetMediaTypeTreeQuery(targetId))

  // then
  expect(result).toEqual({
    name: 'Target',
    mediaTypes: new Map([
      [parentId, { children: new Set([childId]) }],
      [childId, { children: new Set() }],
    ]),
  })
})
