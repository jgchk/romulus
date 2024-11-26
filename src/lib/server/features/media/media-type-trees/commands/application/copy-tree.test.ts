import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeTreeAlreadyExistsError,
  MediaTypeTreeNameInvalidError,
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

test('should copy a media type tree', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await executeCommand(
    repo,
    new CopyTreeCommand('copy', 'Copy', 'original', userId, permissions),
  )

  // then
  expect(error).toBeUndefined()
})

test('should copy a media type tree if the user has admin permissions', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.ADMIN])
  await given(repo, [new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await executeCommand(
    repo,
    new CopyTreeCommand('copy', 'Copy', 'original', userId, permissions),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the original tree does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  const userId = 0

  // when
  const error = await executeCommand(
    repo,
    new CopyTreeCommand('copy', 'Copy', 'original', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('original'))
})

test('should error if a tree with the new id already exists', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('original', 'Original', userId, permissions),
    new CreateTreeCommand('copy', 'Copy', userId, permissions),
  ])

  // when
  const error = await executeCommand(
    repo,
    new CopyTreeCommand('copy', 'Copy', 'original', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeAlreadyExistsError('copy'))
})

test('should error if the name is empty', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await executeCommand(
    repo,
    new CopyTreeCommand('copy', '', 'original', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(''))
})

test('should error if the name is only whitespace', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await executeCommand(
    repo,
    new CopyTreeCommand('copy', ' ', 'original', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(' '))
})

test('should error if the name is only newlines', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await executeCommand(
    repo,
    new CopyTreeCommand('copy', '\n\n', 'original', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError('\n\n'))
})

test('should error if the use does not have any permissions', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  await given(repo, [
    new CreateTreeCommand('original', 'Original', userId, new Set([MediaTypeTreePermission.WRITE])),
  ])

  // when
  const error = await executeCommand(
    repo,
    new CopyTreeCommand('copy', 'Copy', 'original', userId, new Set()),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})
