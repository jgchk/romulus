import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { MediaTypeTreePermission } from '../domain/roles'
import { MediaTypeAlreadyExistsError, WillCreateCycleError } from '../domain/tree/errors'
import { AddMediaTypeCommand } from './add-media-type'
import { AddParentToMediaTypeCommand } from './add-parent-to-media-type'
import { CopyTreeCommand } from './copy-tree'
import { CreateTreeCommand } from './create-tree'
import { MergeTreesCommand } from './merge-trees'
import { TestHelper } from './test-helper'

test('should merge two trees when the user owns both trees', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees not created by the user when the user has admin permissions', async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const otherUserId = 1
  const adminPermissions = new Set([MediaTypeTreePermission.ADMIN])
  const otherUserPermissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', otherUserId, otherUserPermissions),
    new CreateTreeCommand('target', 'Target', otherUserId, otherUserPermissions),
  ])

  // when
  const error = await t.when(
    new MergeTreesCommand('source', 'target', adminUserId, adminPermissions),
  )

  // then
  expect(error).toBeUndefined()
})

test('should merge a tree with an empty tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
    new AddMediaTypeCommand('source', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should merge an empty tree with a tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
    new AddMediaTypeCommand('target', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees with no conflicts', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
    new AddMediaTypeCommand('source', 'media-type-1', 'Media Type 1', userId, permissions),
    new AddMediaTypeCommand('target', 'media-type-2', 'Media Type 2', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees with a new parent-child relationship', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new AddMediaTypeCommand('base', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('base', 'child', 'Child', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('source', 'child', 'parent', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees with no changes', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new AddMediaTypeCommand('base', 'media-type', 'Media Type', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should handle multiple merges', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
    new AddMediaTypeCommand('source', 'media-type', 'Media Type', userId, permissions),
    new MergeTreesCommand('source', 'target', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should error if the source tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('target', 'Target', userId, permissions)])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('source'))
})

test('should error if the target tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('source', 'Source', userId, permissions)])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('target'))
})

test('should error if a media type already exists in both trees', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
    new AddMediaTypeCommand('source', 'media-type', 'Media Type', userId, permissions),
    new AddMediaTypeCommand('target', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
})

test('should error if a 2-cycle would be created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new AddMediaTypeCommand('base', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('base', 'child', 'Child', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('source', 'child', 'parent', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('target', 'parent', 'child', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toEqual(new WillCreateCycleError(['child', 'parent', 'child']))
})

test('should error if a 3-cycle would be created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new AddMediaTypeCommand('base', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('base', 'child', 'Child', userId, permissions),
    new AddMediaTypeCommand('base', 'grandchild', 'Grandchild', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('source', 'child', 'parent', userId, permissions),
    new AddParentToMediaTypeCommand('source', 'grandchild', 'child', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('target', 'parent', 'grandchild', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toEqual(new WillCreateCycleError(['grandchild', 'parent', 'child', 'grandchild']))
})

test('should error if the user does not have any permissions', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, new Set()))

  // then
  expect(error).toEqual(new UnauthorizedError())
})

test('should error if the user does not own the target tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const otherUserId = 1
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', otherUserId, permissions),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, permissions))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
