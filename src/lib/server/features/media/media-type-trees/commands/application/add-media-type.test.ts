import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeAlreadyExistsError,
  MediaTypeNameInvalidError,
  MediaTypeTreeNotFoundError,
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

test('should add a media type to the tree', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('tree', 'Tree', permissions)])

  // when
  const error = await executeCommand(
    repo,
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type'),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the media type already exists', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree', permissions),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type'),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type'),
  )

  // then
  expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
})

test('should error if the media type name is empty', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('tree', 'Tree', permissions)])

  // when
  const error = await executeCommand(repo, new AddMediaTypeCommand('tree', 'media-type', ''))

  // then
  expect(error).toEqual(new MediaTypeNameInvalidError(''))
})

test('should error if the media type name is only whitespace', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('tree', 'Tree', permissions)])

  // when
  const error = await executeCommand(repo, new AddMediaTypeCommand('tree', 'media-type', ' '))

  // then
  expect(error).toEqual(new MediaTypeNameInvalidError(' '))
})

test('should error if the media type name is only newlines', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('tree', 'Tree', permissions)])

  // when
  const error = await executeCommand(repo, new AddMediaTypeCommand('tree', 'media-type', '\n\n'))

  // then
  expect(error).toEqual(new MediaTypeNameInvalidError('\n\n'))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  await given(repo, [])

  // when
  const error = await executeCommand(
    repo,
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type'),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})
