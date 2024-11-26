import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { MediaTypeTreePermission } from '../domain/roles'
import { MediaTypeAlreadyExistsError, MediaTypeNameInvalidError } from '../domain/tree/errors'
import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { MemoryTreeRepository } from '../infrastructure/memory-tree-repository'
import { AddMediaTypeCommand } from './add-media-type'
import { CreateTreeCommand } from './create-tree'
import { TestHelper } from './test-helper'

test('should add a media type to the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, permissions),
  )

  // then
  expect(error).toBeUndefined()
})

test("should add a media type to another user's tree if the user has admin permissions", async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const regularUserId = 1
  await t.given([
    new CreateTreeCommand('tree', 'Tree', regularUserId, new Set([MediaTypeTreePermission.WRITE])),
  ])

  // when
  const error = await t.when(
    new AddMediaTypeCommand(
      'tree',
      'media-type',
      'Media Type',
      adminUserId,
      new Set([MediaTypeTreePermission.ADMIN]),
    ),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the media type already exists', async () => {
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
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
})

test('should error if the media type name is empty', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await t.when(new AddMediaTypeCommand('tree', 'media-type', '', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeNameInvalidError(''))
})

test('should error if the media type name is only whitespace', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('tree', 'media-type', ' ', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeNameInvalidError(' '))
})

test('should error if the media type name is only newlines', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('tree', 'media-type', '\n\n', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeNameInvalidError('\n\n'))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([])

  // when
  const error = await t.when(
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should error if the user does not have any permissions', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, new Set([MediaTypeTreePermission.WRITE])),
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
    new CreateTreeCommand('tree', 'Tree', userId, new Set([MediaTypeTreePermission.WRITE])),
  ])

  // when
  const error = await t.when(
    new AddMediaTypeCommand(
      'tree',
      'media-type',
      'Media Type',
      otherUserId,
      new Set([MediaTypeTreePermission.WRITE]),
    ),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})
