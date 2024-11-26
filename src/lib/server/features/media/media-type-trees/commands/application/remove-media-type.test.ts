import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { MediaTypeTreePermission } from '../domain/roles'
import { MediaTypeNotFoundError } from '../domain/tree/errors'
import { AddMediaTypeCommand } from './add-media-type'
import { CreateTreeCommand } from './create-tree'
import { RemoveMediaTypeCommand } from './remove-media-type'
import { TestHelper } from './test-helper'

test('should remove a media type from the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test("should remove a media type from another user's tree if you have admin permissions", async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const otherUserId = 1
  const adminPermissions = new Set([MediaTypeTreePermission.ADMIN])
  const otherUserPermissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', otherUserId, otherUserPermissions),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', otherUserId, otherUserPermissions),
  ])

  // when
  const error = await t.when(
    new RemoveMediaTypeCommand('tree', 'media-type', adminUserId, adminPermissions),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the media type does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('media-type'))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, permissions))

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
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, new Set()))

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
    new CreateTreeCommand('tree', 'Tree', otherUserId, permissions),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', otherUserId, permissions),
  ])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, permissions))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
