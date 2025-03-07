import { expect, test } from 'vitest'

import { UnauthorizedError } from '../domain/errors.js'
import { MediaTypeTreeNotFoundError } from '../domain/errors.js'
import { MediaTypeNotFoundError } from '../domain/errors.js'
import { MediaTypeTreesRole } from '../domain/roles.js'
import { AddMediaTypeCommand } from './add-media-type.js'
import { CreateTreeCommand } from './create-tree.js'
import { RemoveMediaTypeCommand } from './remove-media-type.js'
import { SetMainTreeCommand } from './set-main-tree.js'
import { TestHelper } from './test-helper.js'

test('should remove a media type from the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
  ])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test("should remove a media type from another user's tree if you have the admin role", async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const otherUserId = 1
  const adminRoles = new Set([MediaTypeTreesRole.ADMIN])
  const otherUserRoles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', otherUserId, otherUserRoles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', otherUserId, otherUserRoles),
  ])

  // when
  const error = await t.when(
    new RemoveMediaTypeCommand('tree', 'media-type', adminUserId, adminRoles),
  )

  // then
  expect(error).toBeUndefined()
})

test('should remove a media type from the main tree if you have the admin role', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([
    new CreateTreeCommand('tree', 'Main', userId, roles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
    new SetMainTreeCommand('tree', userId, roles),
  ])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should error if removing a media type from the main tree without the admin role', async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const otherUserId = 1
  const adminRoles = new Set([MediaTypeTreesRole.ADMIN])
  const otherUserRoles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', otherUserId, otherUserRoles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', otherUserId, otherUserRoles),
    new SetMainTreeCommand('tree', adminUserId, adminRoles),
  ])

  // when
  const error = await t.when(
    new RemoveMediaTypeCommand('tree', 'media-type', otherUserId, otherUserRoles),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})

test('should error if the media type does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, roles)])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('media-type'))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should error if the user does not have any roles', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
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
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', otherUserId, roles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', otherUserId, roles),
  ])

  // when
  const error = await t.when(new RemoveMediaTypeCommand('tree', 'media-type', userId, roles))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
