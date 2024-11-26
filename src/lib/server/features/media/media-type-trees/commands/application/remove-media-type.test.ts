import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeNotFoundError,
  MediaTypeTreeNotFoundError,
  UnauthorizedError,
} from '../domain/errors'
import { MediaTypeTreePermission } from '../domain/permissions'
import { MemoryTreeRepository } from '../infrastructure/memory-tree-repository'
import { AddMediaTypeCommand, AddMediaTypeCommandHandler } from './add-media-type'
import {
  AddParentToMediaTypeCommand,
  AddParentToMediaTypeCommandHandler,
} from './add-parent-to-media-type'
import { CopyTreeCommand, CopyTreeCommandHandler } from './copy-tree'
import { CreateTreeCommand, CreateTreeCommandHandler } from './create-tree'
import { MergeTreesCommand, MergeTreesCommandHandler } from './merge-trees'
import { RemoveMediaTypeCommand, RemoveMediaTypeCommandHandler } from './remove-media-type'

type Command =
  | CreateTreeCommand
  | AddMediaTypeCommand
  | RemoveMediaTypeCommand
  | AddParentToMediaTypeCommand
  | CopyTreeCommand
  | MergeTreesCommand

async function given(repo: MemoryTreeRepository, commands: Command[]): Promise<void> {
  for (const command of commands) {
    const error = await executeCommand(repo, command)
    if (error instanceof Error) {
      expect.fail(`Failed to execute command: ${error.message}`)
    }
  }
}

async function executeCommand(repo: MemoryTreeRepository, command: Command): Promise<void | Error> {
  if (command instanceof CreateTreeCommand) {
    return new CreateTreeCommandHandler(repo).handle(command)
  } else if (command instanceof AddMediaTypeCommand) {
    return new AddMediaTypeCommandHandler(repo).handle(command)
  } else if (command instanceof RemoveMediaTypeCommand) {
    return new RemoveMediaTypeCommandHandler(repo).handle(command)
  } else if (command instanceof AddParentToMediaTypeCommand) {
    return new AddParentToMediaTypeCommandHandler(repo).handle(command)
  } else if (command instanceof CopyTreeCommand) {
    return new CopyTreeCommandHandler(repo).handle(command)
  } else if (command instanceof MergeTreesCommand) {
    return new MergeTreesCommandHandler(repo).handle(command)
  }
}

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
