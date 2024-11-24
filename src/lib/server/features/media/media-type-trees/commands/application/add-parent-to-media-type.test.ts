import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeNotFoundError,
  MediaTypeTreeNotFoundError,
  UnauthorizedError,
  WillCreateCycleError,
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

type Command =
  | CreateTreeCommand
  | AddMediaTypeCommand
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
  } else if (command instanceof AddParentToMediaTypeCommand) {
    return new AddParentToMediaTypeCommandHandler(repo).handle(command)
  } else if (command instanceof CopyTreeCommand) {
    return new CopyTreeCommandHandler(repo).handle(command)
  } else if (command instanceof MergeTreesCommand) {
    return new MergeTreesCommandHandler(repo).handle(command)
  }
}

test('should add a parent to a media type', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
  )

  // then
  expect(error).toBeUndefined()
})

test("should add a parent to a media type in another user's tree if the user has admin permissions", async () => {
  // given
  const repo = new MemoryTreeRepository()
  const adminUserId = 0
  const adminPermissions = new Set([MediaTypeTreePermission.ADMIN])
  const regularUserId = 1
  const regularUserPermissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', regularUserId, regularUserPermissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', regularUserId, regularUserPermissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', regularUserId, regularUserPermissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', adminUserId, adminPermissions),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the child media type does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('child'))
})

test('should error if the parent media type does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('parent'))
})

test('should error if a 1-cycle would be created', async () => {
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
    new AddParentToMediaTypeCommand('tree', 'media-type', 'media-type', userId, permissions),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['media-type', 'media-type']))
})

test('should error if a 2-cycle would be created', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'parent', 'child', userId, permissions),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'parent']))
})

test('should error if a 3-cycle would be created', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
    new AddMediaTypeCommand('tree', 'grandchild', 'Grandchild', userId, permissions),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
    new AddParentToMediaTypeCommand('tree', 'grandchild', 'child', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'parent', 'grandchild', userId, permissions),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'grandchild', 'parent']))
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
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, permissions),
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
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, new Set()),
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
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', otherUserId, permissions),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})
