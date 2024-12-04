import { expect, test } from 'vitest'

import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { MediaTypeAlreadyExistsError, MediaTypeNameInvalidError } from '../domain/errors'
import { MediaTypeTreesRole } from '../domain/roles'
import { AddMediaTypeCommand } from './add-media-type'
import { CreateTreeCommand } from './create-tree'
import { SetMainTreeCommand } from './set-main-tree'
import { TestHelper } from './test-helper'

test('should add a media type to the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, roles)])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
  )

  // then
  expect(error).toBeUndefined()
})

test("should add a media type to another user's tree if the user has the admin role", async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const regularUserId = 1
  await t.given([
    new CreateTreeCommand('tree', 'Tree', regularUserId, new Set([MediaTypeTreesRole.WRITE])),
  ])

  // when
  const error = await t.when(
    new AddMediaTypeCommand(
      'tree',
      'media-type',
      'Media Type',
      adminUserId,
      new Set([MediaTypeTreesRole.ADMIN]),
    ),
  )

  // then
  expect(error).toBeUndefined()
})

test('should add a media type to the main tree if the user has the admin role', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([
    new CreateTreeCommand('main', 'Main', userId, roles),
    new SetMainTreeCommand('main', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('main', 'media-type', 'Media Type', userId, roles),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if adding a media type to the main tree if the user does not have the admin role', async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const regularUserId = 1
  const adminRoles = new Set([MediaTypeTreesRole.ADMIN])
  const regularUserRoles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('main', 'Main', regularUserId, regularUserRoles),
    new SetMainTreeCommand('main', adminUserId, adminRoles),
  ])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('main', 'media-type', 'Media Type', regularUserId, regularUserRoles),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})

test('should error if the media type already exists', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
  )

  // then
  expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
})

test('should error if the media type name is empty', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, roles)])

  // when
  const error = await t.when(new AddMediaTypeCommand('tree', 'media-type', '', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeNameInvalidError(''))
})

test('should error if the media type name is only whitespace', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, roles)])

  // when
  const error = await t.when(new AddMediaTypeCommand('tree', 'media-type', ' ', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeNameInvalidError(' '))
})

test('should error if the media type name is only newlines', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, roles)])

  // when
  const error = await t.when(new AddMediaTypeCommand('tree', 'media-type', '\n\n', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeNameInvalidError('\n\n'))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should error if the user does not have any roles', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, new Set([MediaTypeTreesRole.WRITE])),
  ])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, new Set()),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})

test('should error if the user does not own the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const otherUserId = 1
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, new Set([MediaTypeTreesRole.WRITE])),
  ])

  // when
  const error = await t.when(
    new AddMediaTypeCommand(
      'tree',
      'media-type',
      'Media Type',
      otherUserId,
      new Set([MediaTypeTreesRole.WRITE]),
    ),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})
