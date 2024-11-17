import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { MemoryIdGenerator } from '../../../infrastructure/memory-id-generator'
import { CycleError, MediaTypeNotFoundError, MediaTypeTree } from '../tree'
import { AddMediaTypeToTreeEvent } from './add-media-type-to-tree'
import { AddParentToMediaTypeEvent } from './add-parent-to-media-type'

test('should add a parent to a media type', () => {
  const tree = new MediaTypeTree()
  const idGenerator = new MemoryIdGenerator()

  const id = addMediaType(idGenerator, tree)
  const parentId = addMediaType(idGenerator, tree)

  const addParentResult = new AddParentToMediaTypeEvent(id, parentId).process(tree)
  if (addParentResult instanceof Error) {
    expect.fail(`Failed to add parent to media type: ${addParentResult.message}`)
  }

  const parent = tree.get(parentId)
  expect(parent).toBeDefined()
  expect(parent?.hasChild(id)).toBe(true)
})

test("should error if the media type doesn't exist", () => {
  const tree = new MediaTypeTree()
  const idGenerator = new MemoryIdGenerator()

  const id = idGenerator.generate()
  const parentId = idGenerator.generate()

  const addParentResult = new AddParentToMediaTypeEvent(id, parentId).process(tree)

  expect(addParentResult).toBeInstanceOf(MediaTypeNotFoundError)
  expect((addParentResult as MediaTypeNotFoundError).id).toBe(id)
})

test("should error if parent media type doesn't exist", () => {
  const tree = new MediaTypeTree()
  const idGenerator = new MemoryIdGenerator()

  const id = addMediaType(idGenerator, tree)
  const nonexistentParentId = idGenerator.generate()

  const addParentResult = new AddParentToMediaTypeEvent(id, nonexistentParentId).process(tree)

  expect(addParentResult).toBeInstanceOf(MediaTypeNotFoundError)
  expect((addParentResult as MediaTypeNotFoundError).id).toBe(nonexistentParentId)
})

test('should error when creating a 1-cycle in the tree', () => {
  const tree = new MediaTypeTree()
  const idGenerator = new MemoryIdGenerator()

  const id = addMediaType(idGenerator, tree)

  const addParentResult = new AddParentToMediaTypeEvent(id, id).process(tree)

  expect(addParentResult).toBeInstanceOf(CycleError)
  expect((addParentResult as CycleError).cycle).toEqual([id, id])
})

test('should error when creating a 2-cycle in the tree', () => {
  const tree = new MediaTypeTree()
  const idGenerator = new MemoryIdGenerator()

  // Create structure: A → B → A
  const a = addMediaType(idGenerator, tree)
  const b = addMediaType(idGenerator, tree)

  const aParentResult = new AddParentToMediaTypeEvent(b, a).process(tree)
  if (aParentResult instanceof Error) {
    expect.fail(`Failed to add parent to media type: ${aParentResult.message}`)
  }

  const addCycleResult = new AddParentToMediaTypeEvent(a, b).process(tree)
  expect(addCycleResult).toBeInstanceOf(CycleError)
  expect((addCycleResult as unknown as CycleError).cycle).toEqual([a, b, a])
})

test('should error when creating a 3-cycle in the tree', () => {
  const tree = new MediaTypeTree()
  const idGenerator = new MemoryIdGenerator()

  // Create structure: A → B → C → A
  const a = addMediaType(idGenerator, tree)
  const b = addMediaType(idGenerator, tree)
  const c = addMediaType(idGenerator, tree)

  const aParentResult = new AddParentToMediaTypeEvent(b, a).process(tree)
  if (aParentResult instanceof Error) {
    expect.fail(`Failed to add parent to media type: ${aParentResult.message}`)
  }

  const bParentResult = new AddParentToMediaTypeEvent(c, b).process(tree)
  if (bParentResult instanceof Error) {
    expect.fail(`Failed to add parent to media type: ${bParentResult.message}`)
  }

  const addCycleResult = new AddParentToMediaTypeEvent(a, c).process(tree)
  expect(addCycleResult).toBeInstanceOf(CycleError)
  expect((addCycleResult as unknown as CycleError).cycle).toEqual([a, b, c, a])
})

function addMediaType(idGenerator: MemoryIdGenerator, tree: MediaTypeTree) {
  const id = idGenerator.generate()
  const addMediaTypeEvent = new AddMediaTypeToTreeEvent(id)
  const addMediaTypeResult = addMediaTypeEvent.process(tree)
  if (addMediaTypeResult instanceof Error) {
    expect.fail(`Failed to add media type to tree: ${addMediaTypeResult.message}`)
  }
  return id
}
