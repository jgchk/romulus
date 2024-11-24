import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { MediaTypeNotFoundError, MediaTypeTreeNotFoundError } from '../domain/errors'
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
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree'),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type'),
  ])

  // when
  const error = await executeCommand(repo, new RemoveMediaTypeCommand('tree', 'media-type'))

  // then
  expect(error).toBeUndefined()
})

test('should error if the media type does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  await given(repo, [new CreateTreeCommand('tree', 'Tree')])

  // when
  const error = await executeCommand(repo, new RemoveMediaTypeCommand('tree', 'media-type'))

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('media-type'))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  await given(repo, [])

  // when
  const error = await executeCommand(repo, new RemoveMediaTypeCommand('tree', 'media-type'))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  await given(repo, [])

  // when
  const error = await executeCommand(repo, new RemoveMediaTypeCommand('tree', 'media-type'))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})
