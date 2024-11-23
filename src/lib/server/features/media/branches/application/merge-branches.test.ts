import { expect } from 'vitest'

import { test } from '../../../../../../vitest-setup'
import { MediaTypeAlreadyExistsError } from '../domain/tree/errors'
import { MediaTypeTree } from '../domain/tree/tree'
import { MemoryTreeRepository } from '../infrastructure/memory-tree-repository'
import { MergeBranchesCommand, MergeBranchesCommandHandler } from './merge-branches'

test('should merge two empty trees', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  const handler = new MergeBranchesCommandHandler(repo)

  const sourceTree = MediaTypeTree.fromEvents([])
  const targetTree = MediaTypeTree.fromEvents([])

  repo.save('source', sourceTree)
  repo.save('target', targetTree)

  // act
  const error = await handler.handle(new MergeBranchesCommand('source', 'target'))

  // assert
  expect(error).toBeUndefined()
})

test('should merge a tree with an empty tree', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  const handler = new MergeBranchesCommandHandler(repo)

  const sourceTree = MediaTypeTree.fromEvents([])
  const targetTree = MediaTypeTree.fromEvents([])

  sourceTree.addMediaType('media-type', 'Media Type')

  repo.save('source', sourceTree)
  repo.save('target', targetTree)

  // act
  const error = await handler.handle(new MergeBranchesCommand('source', 'target'))

  // assert
  expect(error).toBeUndefined()
})

test('should merge an empty state with a tree', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  const handler = new MergeBranchesCommandHandler(repo)

  const sourceTree = MediaTypeTree.fromEvents([])
  const targetTree = MediaTypeTree.fromEvents([])

  targetTree.addMediaType('media-type', 'Media Type')

  repo.save('source', sourceTree)
  repo.save('target', targetTree)

  // act
  const error = await handler.handle(new MergeBranchesCommand('source', 'target'))

  // assert
  expect(error).toBeUndefined()
})

test('should merge two trees with no conflicts', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  const handler = new MergeBranchesCommandHandler(repo)

  const sourceTree = MediaTypeTree.fromEvents([])
  const targetTree = MediaTypeTree.fromEvents([])

  sourceTree.addMediaType('media-type-1', 'Media Type 1')
  targetTree.addMediaType('media-type-2', 'Media Type 2')

  repo.save('source', sourceTree)
  repo.save('target', targetTree)

  // act
  const error = await handler.handle(new MergeBranchesCommand('source', 'target'))

  // assert
  expect(error).toBeUndefined()
})

test('should error if a media type already exists in both trees', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  const handler = new MergeBranchesCommandHandler(repo)

  const sourceTree = MediaTypeTree.fromEvents([])
  const targetTree = MediaTypeTree.fromEvents([])

  sourceTree.addMediaType('media-type', 'Media Type')
  targetTree.addMediaType('media-type', 'Media Type')

  repo.save('source', sourceTree)
  repo.save('target', targetTree)

  // act
  const error = await handler.handle(new MergeBranchesCommand('source', 'target'))

  // assert
  expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
})

test('should merge two trees with a new parent-child relationship', () => {
  // arrange
  const repo = new MemoryTreeRepository()
  const handler = new MergeBranchesCommandHandler(repo)

  const sourceTree = MediaTypeTree.fromEvents([])
  const targetTree = MediaTypeTree.fromEvents([])

  // TODO: branch-from command
  // TODO: update all tests to use commands for setup rather than directly calling methods
})
