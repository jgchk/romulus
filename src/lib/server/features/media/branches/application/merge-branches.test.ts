/* eslint-disable returned-errors/enforce-error-handling */
import { expect } from 'vitest'

import { test } from '../../../../../../vitest-setup'
import { MediaTypeAlreadyExistsError, WillCreateCycleError } from '../domain/tree/errors'
import { MemoryTreeRepository } from '../infrastructure/memory-tree-repository'
import { AddMediaTypeCommand, AddMediaTypeCommandHandler } from './add-media-type'
import {
  AddParentToMediaTypeCommand,
  AddParentToMediaTypeCommandHandler,
} from './add-parent-to-media-type'
import { BranchFromCommand, BranchFromCommandHandler } from './branch-from'
import { CreateBranchCommand, CreateBranchCommandHandler } from './create-branch'
import { MergeBranchesCommand, MergeBranchesCommandHandler } from './merge-branches'

test('should merge two empty trees', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('source', 'Source'))
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('target', 'Target'))

  // act
  const error = await new MergeBranchesCommandHandler(repo).handle(
    new MergeBranchesCommand('source', 'target'),
  )

  // assert
  expect(error).toBeUndefined()
})

test('should merge a tree with an empty tree', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('source', 'Source'))
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('target', 'Target'))
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('source', 'media-type', 'Media Type'),
  )

  // act
  const error = await new MergeBranchesCommandHandler(repo).handle(
    new MergeBranchesCommand('source', 'target'),
  )

  // assert
  expect(error).toBeUndefined()
})

test('should merge an empty state with a tree', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('source', 'Source'))
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('target', 'Target'))
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('target', 'media-type', 'Media Type'),
  )

  // act
  const error = await new MergeBranchesCommandHandler(repo).handle(
    new MergeBranchesCommand('source', 'target'),
  )

  // assert
  expect(error).toBeUndefined()
})

test('should merge two trees with no conflicts', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('source', 'Source'))
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('target', 'Target'))
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('source', 'media-type-1', 'Media Type 1'),
  )
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('target', 'media-type-2', 'Media Type 2'),
  )

  // act
  const error = await new MergeBranchesCommandHandler(repo).handle(
    new MergeBranchesCommand('source', 'target'),
  )

  // assert
  expect(error).toBeUndefined()
})

test('should error if a media type already exists in both trees', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('source', 'Source'))
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('target', 'Target'))
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('source', 'media-type', 'Media Type'),
  )
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('target', 'media-type', 'Media Type'),
  )

  // act
  const error = await new MergeBranchesCommandHandler(repo).handle(
    new MergeBranchesCommand('source', 'target'),
  )

  // assert
  expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
})

test('should merge two trees with a new parent-child relationship', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('base', 'Base'))
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('base', 'parent', 'Parent'),
  )
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('base', 'child', 'Child'),
  )
  await new BranchFromCommandHandler(repo).handle(new BranchFromCommand('source', 'Source', 'base'))
  await new AddParentToMediaTypeCommandHandler(repo).handle(
    new AddParentToMediaTypeCommand('source', 'child', 'parent'),
  )
  await new BranchFromCommandHandler(repo).handle(new BranchFromCommand('target', 'Target', 'base'))

  // act
  const error = await new MergeBranchesCommandHandler(repo).handle(
    new MergeBranchesCommand('source', 'target'),
  )

  // assert
  expect(error).toBeUndefined()
})

test('should error if a 2-cycle would be created', async () => {
  // arrange
  const repo = new MemoryTreeRepository()
  await new CreateBranchCommandHandler(repo).handle(new CreateBranchCommand('base', 'Base'))
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('base', 'parent', 'Parent'),
  )
  await new AddMediaTypeCommandHandler(repo).handle(
    new AddMediaTypeCommand('base', 'child', 'Child'),
  )
  await new BranchFromCommandHandler(repo).handle(new BranchFromCommand('source', 'Source', 'base'))
  await new AddParentToMediaTypeCommandHandler(repo).handle(
    new AddParentToMediaTypeCommand('source', 'child', 'parent'),
  )
  await new BranchFromCommandHandler(repo).handle(new BranchFromCommand('target', 'Target', 'base'))
  await new AddParentToMediaTypeCommandHandler(repo).handle(
    new AddParentToMediaTypeCommand('target', 'parent', 'child'),
  )

  // act
  const error = await new MergeBranchesCommandHandler(repo).handle(
    new MergeBranchesCommand('source', 'target'),
  )

  // assert
  expect(error).toEqual(new WillCreateCycleError(['child', 'parent', 'child']))
})
