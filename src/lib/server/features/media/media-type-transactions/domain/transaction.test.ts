import { describe, expect } from 'vitest'

import { test } from '../../../../../../vitest-setup'
import { MediaTypeAddedEvent, MediaTypeParentAddedEvent } from '../../media-type-tree/domain/events'
import {
  CycleError,
  MediaTypeNotFoundError,
  MediaTypeTree,
} from '../../media-type-tree/domain/tree'
import { Transaction } from './transaction'

describe('addMediaType()', () => {
  test('should return a transaction media type added event', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)
    const event = transaction.addMediaType()
    expect(event).toBeInstanceOf(MediaTypeAddedEvent)
    expect(event.id).toBeTypeOf('number')
  })
})

describe('addParentToMediaType()', () => {
  test('should add a parent to a media type', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)

    const parent = transaction.addMediaType()
    const child = transaction.addMediaType()

    const event = transaction.addParentToMediaType(child.id, parent.id)
    expect(event).toBeInstanceOf(MediaTypeParentAddedEvent)
    expect((event as MediaTypeParentAddedEvent).parentId).toBe(parent.id)
    expect((event as MediaTypeParentAddedEvent).childId).toBe(child.id)
  })

  test("should error if the child media type doesn't exist", () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)

    const parent = transaction.addMediaType()
    const child = { id: parent.id + 1 }

    const addParentResult = transaction.addParentToMediaType(child.id, parent.id)

    expect(addParentResult).toBeInstanceOf(MediaTypeNotFoundError)
    expect((addParentResult as MediaTypeNotFoundError).id).toBe(child.id)
  })

  test("should error if parent media type doesn't exist", () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)

    const child = transaction.addMediaType()
    const parent = { id: child.id + 1 }

    const addParentResult = transaction.addParentToMediaType(child.id, parent.id)

    expect(addParentResult).toBeInstanceOf(MediaTypeNotFoundError)
    expect((addParentResult as MediaTypeNotFoundError).id).toBe(parent.id)
  })

  test('should error when creating a 1-cycle in the tree', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)

    const mediaType = transaction.addMediaType()

    const addParentResult = transaction.addParentToMediaType(mediaType.id, mediaType.id)

    expect(addParentResult).toBeInstanceOf(CycleError)
    expect((addParentResult as CycleError).cycle).toEqual([mediaType.id, mediaType.id])
  })

  test('should error when creating a 2-cycle in the tree', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)

    // Create structure: A → B → A
    const a = transaction.addMediaType()
    const b = transaction.addMediaType()

    const aParentResult = transaction.addParentToMediaType(b.id, a.id)
    if (aParentResult instanceof Error) {
      expect.fail(`Failed to add parent to media type: ${aParentResult.message}`)
    }

    const addCycleResult = transaction.addParentToMediaType(a.id, b.id)
    expect(addCycleResult).toBeInstanceOf(CycleError)
    expect((addCycleResult as unknown as CycleError).cycle).toEqual([a.id, b.id, a.id])
  })

  test('should error when creating a 3-cycle in the tree', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)

    // Create structure: A → B → C → A
    const a = transaction.addMediaType()
    const b = transaction.addMediaType()
    const c = transaction.addMediaType()

    const aParentResult = transaction.addParentToMediaType(b.id, a.id)
    if (aParentResult instanceof Error) {
      expect.fail(`Failed to add parent to media type: ${aParentResult.message}`)
    }

    const bParentResult = transaction.addParentToMediaType(c.id, b.id)
    if (bParentResult instanceof Error) {
      expect.fail(`Failed to add parent to media type: ${bParentResult.message}`)
    }

    const addCycleResult = transaction.addParentToMediaType(a.id, c.id)
    expect(addCycleResult).toBeInstanceOf(CycleError)
    expect((addCycleResult as unknown as CycleError).cycle).toEqual([a.id, b.id, c.id, a.id])
  })
})

describe('getMediaTypeTreeView()', () => {
  test('should return the media type tree with no changes applied', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)
    const treeView = transaction.getMediaTypeTreeView()
    expect(treeView).toEqual(startingTree)
  })

  test('should return the media type tree with changes applied', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)

    transaction.addMediaType()
    const treeView = transaction.getMediaTypeTreeView()

    const expectedTree = MediaTypeTree.create()
    expectedTree.addMediaType()

    expect(treeView).toEqual(expectedTree)
  })
})
