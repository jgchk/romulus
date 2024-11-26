import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeNotFoundError,
  MediaTypeTreeNotFoundError,
  UnauthorizedError,
} from '../domain/tree/errors'
import { MediaTypeTreePermission } from '../domain/tree/permissions'
import { MemoryTreeRepository } from '../infrastructure/memory-tree-repository'
import { AddMediaTypeCommand } from './add-media-type'
import { CreateTreeCommand } from './create-tree'
import { RemoveMediaTypeCommand } from './remove-media-type'
import { executeCommand, given } from './test-helpers'

test('should remove a media type from the tree', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new RemoveMediaTypeCommand('tree', 'media-type', userId, permissions),
  )

  // then
  expect(error).toBeUndefined()
})

test("should remove a media type from another user's tree if you have admin permissions", async () => {
  // given
  const repo = new MemoryTreeRepository()
  const adminUserId = 0
  const otherUserId = 1
  const adminPermissions = new Set([MediaTypeTreePermission.ADMIN])
  const otherUserPermissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', otherUserId, otherUserPermissions),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', otherUserId, otherUserPermissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new RemoveMediaTypeCommand('tree', 'media-type', adminUserId, adminPermissions),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the media type does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await executeCommand(
    repo,
    new RemoveMediaTypeCommand('tree', 'media-type', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('media-type'))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [])

  // when
  const error = await executeCommand(
    repo,
    new RemoveMediaTypeCommand('tree', 'media-type', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should error if the user does not have any permissions', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new RemoveMediaTypeCommand('tree', 'media-type', userId, new Set()),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})

test('should error if the user does not own the tree', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const otherUserId = 1
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', otherUserId, permissions),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', otherUserId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new RemoveMediaTypeCommand('tree', 'media-type', userId, permissions),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})
