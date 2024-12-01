import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { MediaTypeAlreadyExistsError, WillCreateCycleError } from '../domain/errors'
import { MediaTypeTreesRole } from '../domain/roles'
import { AddMediaTypeCommand } from './add-media-type'
import { AddParentToMediaTypeCommand } from './add-parent-to-media-type'
import { CopyTreeCommand } from './copy-tree'
import { CreateTreeCommand } from './create-tree'
import { MergeTreesCommand } from './merge-trees'
import { SetMainTreeCommand } from './set-main-tree'
import { TestHelper } from './test-helper'

test('should merge two trees when the user owns both trees', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, roles),
    new CreateTreeCommand('target', 'Target', userId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees not created by the user when the user has the admin role', async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const otherUserId = 1
  const adminRoles = new Set([MediaTypeTreesRole.ADMIN])
  const otherUserRoles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', otherUserId, otherUserRoles),
    new CreateTreeCommand('target', 'Target', otherUserId, otherUserRoles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', adminUserId, adminRoles))

  // then
  expect(error).toBeUndefined()
})

test('should merge into the main tree when the user has the admin role', async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const otherUserId = 1
  const adminRoles = new Set([MediaTypeTreesRole.ADMIN])
  const otherUserRoles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', otherUserId, otherUserRoles),
    new CreateTreeCommand('target', 'Target', otherUserId, otherUserRoles),
    new SetMainTreeCommand('target', adminUserId, adminRoles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', adminUserId, adminRoles))

  // then
  expect(error).toBeUndefined()
})

test('should merge a tree with an empty tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, roles),
    new CreateTreeCommand('target', 'Target', userId, roles),
    new AddMediaTypeCommand('source', 'media-type', 'Media Type', userId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should merge an empty tree with a tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, roles),
    new CreateTreeCommand('target', 'Target', userId, roles),
    new AddMediaTypeCommand('target', 'media-type', 'Media Type', userId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees with no conflicts', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, roles),
    new CreateTreeCommand('target', 'Target', userId, roles),
    new AddMediaTypeCommand('source', 'media-type-1', 'Media Type 1', userId, roles),
    new AddMediaTypeCommand('target', 'media-type-2', 'Media Type 2', userId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees with a new parent-child relationship', async () => {
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
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees with no changes', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('base', 'Base', userId, roles),
    new AddMediaTypeCommand('base', 'media-type', 'Media Type', userId, roles),
    new CopyTreeCommand('source', 'Source', 'base', userId, roles),
    new CopyTreeCommand('target', 'Target', 'base', userId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should handle multiple merges', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('base', 'Base', userId, roles),
    new CopyTreeCommand('source', 'Source', 'base', userId, roles),
    new CopyTreeCommand('target', 'Target', 'base', userId, roles),
    new AddMediaTypeCommand('source', 'media-type', 'Media Type', userId, roles),
    new MergeTreesCommand('source', 'target', userId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should error if merging into the main tree without the admin role', async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const otherUserId = 1
  const adminRoles = new Set([MediaTypeTreesRole.ADMIN])
  const otherUserRoles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', otherUserId, otherUserRoles),
    new CreateTreeCommand('target', 'Target', otherUserId, otherUserRoles),
    new SetMainTreeCommand('target', adminUserId, adminRoles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', otherUserId, otherUserRoles))

  // then
  expect(error).toEqual(new UnauthorizedError())
})

test('should error if the source tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('target', 'Target', userId, roles)])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('source'))
})

test('should error if the target tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('source', 'Source', userId, roles)])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('target'))
})

test('should error if a media type already exists in both trees', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, roles),
    new CreateTreeCommand('target', 'Target', userId, roles),
    new AddMediaTypeCommand('source', 'media-type', 'Media Type', userId, roles),
    new AddMediaTypeCommand('target', 'media-type', 'Media Type', userId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
})

test('should error if a 2-cycle would be created', async () => {
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
    new AddParentToMediaTypeCommand('target', 'parent', 'child', userId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toEqual(new WillCreateCycleError(['child', 'parent', 'child']))
})

test('should error if a 3-cycle would be created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('base', 'Base', userId, roles),
    new AddMediaTypeCommand('base', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('base', 'child', 'Child', userId, roles),
    new AddMediaTypeCommand('base', 'grandchild', 'Grandchild', userId, roles),
    new CopyTreeCommand('source', 'Source', 'base', userId, roles),
    new AddParentToMediaTypeCommand('source', 'child', 'parent', userId, roles),
    new AddParentToMediaTypeCommand('source', 'grandchild', 'child', userId, roles),
    new CopyTreeCommand('target', 'Target', 'base', userId, roles),
    new AddParentToMediaTypeCommand('target', 'parent', 'grandchild', userId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toEqual(new WillCreateCycleError(['grandchild', 'parent', 'child', 'grandchild']))
})

test('should error if the user does not have any roles', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, roles),
    new CreateTreeCommand('target', 'Target', userId, roles),
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
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, roles),
    new CreateTreeCommand('target', 'Target', otherUserId, roles),
  ])

  // when
  const error = await t.when(new MergeTreesCommand('source', 'target', userId, roles))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
