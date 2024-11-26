import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeAlreadyExistsError,
  MediaTypeTreeNotFoundError,
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

test('should merge two empty trees', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toBeUndefined()
})

test('should merge a tree with an empty tree', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
    new AddMediaTypeCommand('source', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toBeUndefined()
})

test('should merge an empty tree with a tree', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
    new AddMediaTypeCommand('target', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees with no conflicts', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
    new AddMediaTypeCommand('source', 'media-type-1', 'Media Type 1', userId, permissions),
    new AddMediaTypeCommand('target', 'media-type-2', 'Media Type 2', userId, permissions),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees with a new parent-child relationship', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new AddMediaTypeCommand('base', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('base', 'child', 'Child', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('source', 'child', 'parent', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toBeUndefined()
})

test('should merge two trees with no changes', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new AddMediaTypeCommand('base', 'media-type', 'Media Type', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toBeUndefined()
})

test('should handle multiple merges', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
    new AddMediaTypeCommand('source', 'media-type', 'Media Type', userId, permissions),
    new MergeTreesCommand('source', 'target'),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toBeUndefined()
})

test('should error if the source tree does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('target', 'Target', userId, permissions)])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('source'))
})

test('should error if the target tree does not exist', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('source', 'Source', userId, permissions)])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('target'))
})

test('should error if a media type already exists in both trees', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('source', 'Source', userId, permissions),
    new CreateTreeCommand('target', 'Target', userId, permissions),
    new AddMediaTypeCommand('source', 'media-type', 'Media Type', userId, permissions),
    new AddMediaTypeCommand('target', 'media-type', 'Media Type', userId, permissions),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
})

test('should error if a 2-cycle would be created', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new AddMediaTypeCommand('base', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('base', 'child', 'Child', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('source', 'child', 'parent', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('target', 'parent', 'child', userId, permissions),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toEqual(new WillCreateCycleError(['child', 'parent', 'child']))
})

test('should error if a 3-cycle would be created', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [
    new CreateTreeCommand('base', 'Base', userId, permissions),
    new AddMediaTypeCommand('base', 'parent', 'Parent', userId, permissions),
    new AddMediaTypeCommand('base', 'child', 'Child', userId, permissions),
    new AddMediaTypeCommand('base', 'grandchild', 'Grandchild', userId, permissions),
    new CopyTreeCommand('source', 'Source', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('source', 'child', 'parent', userId, permissions),
    new AddParentToMediaTypeCommand('source', 'grandchild', 'child', userId, permissions),
    new CopyTreeCommand('target', 'Target', 'base', userId, permissions),
    new AddParentToMediaTypeCommand('target', 'parent', 'grandchild', userId, permissions),
  ])

  // when
  const error = await executeCommand(repo, new MergeTreesCommand('source', 'target'))

  // then
  expect(error).toEqual(new WillCreateCycleError(['grandchild', 'parent', 'child', 'grandchild']))
})
