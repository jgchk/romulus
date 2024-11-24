import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { MediaTypeNotFoundError, WillCreateCycleError } from '../domain/errors'
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
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree'),
    new AddMediaTypeCommand('tree', 'parent', 'Parent'),
    new AddMediaTypeCommand('tree', 'child', 'Child'),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type'),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the child media type does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree'),
    new AddMediaTypeCommand('tree', 'parent', 'Parent'),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'child', 'parent'),
  )

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('child'))
})

test('should error if the parent media type does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree'),
    new AddMediaTypeCommand('tree', 'child', 'Child'),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'child', 'parent'),
  )

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('parent'))
})

test('should error if a 1-cycle would be created', async () => {
  // given
  const repo = new MemoryTreeRepository()
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree'),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type'),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'media-type', 'media-type'),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['media-type', 'media-type']))
})

test('should error if a 2-cycle would be created', async () => {
  // given
  const repo = new MemoryTreeRepository()
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree'),
    new AddMediaTypeCommand('tree', 'parent', 'Parent'),
    new AddMediaTypeCommand('tree', 'child', 'Child'),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent'),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'parent', 'child'),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'parent']))
})

test('should error if a 3-cycle would be created', async () => {
  // given
  const repo = new MemoryTreeRepository()
  await given(repo, [
    new CreateTreeCommand('tree', 'Tree'),
    new AddMediaTypeCommand('tree', 'parent', 'Parent'),
    new AddMediaTypeCommand('tree', 'child', 'Child'),
    new AddMediaTypeCommand('tree', 'grandchild', 'Grandchild'),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent'),
    new AddParentToMediaTypeCommand('tree', 'grandchild', 'child'),
  ])

  // when
  const error = await executeCommand(
    repo,
    new AddParentToMediaTypeCommand('tree', 'parent', 'grandchild'),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'grandchild', 'parent']))
})
