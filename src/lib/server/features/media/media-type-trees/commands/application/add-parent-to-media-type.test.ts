import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { MediaTypeTreePermission } from '../domain/roles'
import { MediaTypeNotFoundError, WillCreateCycleError } from '../domain/tree/errors'
import { AddMediaTypeCommand } from './add-media-type'
import { AddParentToMediaTypeCommand } from './add-parent-to-media-type'
import { CreateTreeCommand } from './create-tree'
import { TestHelper } from './test-helper'

test('should add a parent to a media type', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
  )

  // then
  expect(error).toBeUndefined()
})

test("should add a parent to a media type in another user's tree if the user has admin permissions", async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const adminPermissions = new Set([MediaTypeTreePermission.ADMIN])
  const regularUserId = 1
  const regularUserPermissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', regularUserId, regularUserPermissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', regularUserId, regularUserPermissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', regularUserId, regularUserPermissions),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', adminUserId, adminPermissions),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the child media type does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('child'))
})

test('should error if the parent media type does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('parent'))
})

test('should error if a 1-cycle would be created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'media-type', 'media-type', userId, permissions),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['media-type', 'media-type']))
})

test('should error if a 2-cycle would be created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'parent', 'child', userId, permissions),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'parent']))
})

test('should error if a 3-cycle would be created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
    new AddMediaTypeCommand('tree', 'grandchild', 'Grandchild', userId, permissions),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
    new AddParentToMediaTypeCommand('tree', 'grandchild', 'child', userId, permissions),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'parent', 'grandchild', userId, permissions),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'grandchild', 'parent']))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should error if the user does not have any permissions', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, new Set()),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})

test('should error if the user does not own the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const otherUserId = 1
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', otherUserId, permissions),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})
