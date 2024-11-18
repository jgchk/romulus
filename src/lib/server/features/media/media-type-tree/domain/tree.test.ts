import { describe, expect } from 'vitest'

import { test } from '../../../../../../vitest-setup'
import { MediaTypeAddedEvent, MediaTypeParentAddedEvent } from './events'
import { CycleError, MediaTypeNotFoundError, MediaTypeTree } from './tree'

describe('addMediaType()', () => {
  test('should add a media type to the tree', () => {
    const tree = MediaTypeTree.create()
    const event = tree.addMediaType()
    expect(event).toBeInstanceOf(MediaTypeAddedEvent)
    expect(event.id).toBeTypeOf('number')
  })
})

describe('addParentToMediaType()', () => {
  test('should add a parent to a media type', () => {
    const tree = MediaTypeTree.create()

    const parent = tree.addMediaType()
    const child = tree.addMediaType()

    const event = tree.addParentToMediaType(child.id, parent.id)
    expect(event).toBeInstanceOf(MediaTypeParentAddedEvent)
    expect((event as MediaTypeParentAddedEvent).parentId).toBe(parent.id)
    expect((event as MediaTypeParentAddedEvent).childId).toBe(child.id)
  })

  test("should error if the child media type doesn't exist", () => {
    const tree = MediaTypeTree.create()

    const parent = tree.addMediaType()
    const child = { id: parent.id + 1 }

    const addParentResult = tree.addParentToMediaType(child.id, parent.id)

    expect(addParentResult).toBeInstanceOf(MediaTypeNotFoundError)
    expect((addParentResult as MediaTypeNotFoundError).id).toBe(child.id)
  })

  test("should error if parent media type doesn't exist", () => {
    const tree = MediaTypeTree.create()

    const child = tree.addMediaType()
    const parent = { id: child.id + 1 }

    const addParentResult = tree.addParentToMediaType(child.id, parent.id)

    expect(addParentResult).toBeInstanceOf(MediaTypeNotFoundError)
    expect((addParentResult as MediaTypeNotFoundError).id).toBe(parent.id)
  })

  test('should error when creating a 1-cycle in the tree', () => {
    const tree = MediaTypeTree.create()

    const mediaType = tree.addMediaType()

    const addParentResult = tree.addParentToMediaType(mediaType.id, mediaType.id)

    expect(addParentResult).toBeInstanceOf(CycleError)
    expect((addParentResult as CycleError).cycle).toEqual([mediaType.id, mediaType.id])
  })

  test('should error when creating a 2-cycle in the tree', () => {
    const tree = MediaTypeTree.create()

    // Create structure: A → B → A
    const a = tree.addMediaType()
    const b = tree.addMediaType()

    const aParentResult = tree.addParentToMediaType(b.id, a.id)
    if (aParentResult instanceof Error) {
      expect.fail(`Failed to add parent to media type: ${aParentResult.message}`)
    }

    const addCycleResult = tree.addParentToMediaType(a.id, b.id)
    expect(addCycleResult).toBeInstanceOf(CycleError)
    expect((addCycleResult as unknown as CycleError).cycle).toEqual([a.id, b.id, a.id])
  })

  test('should error when creating a 3-cycle in the tree', () => {
    const tree = MediaTypeTree.create()

    // Create structure: A → B → C → A
    const a = tree.addMediaType()
    const b = tree.addMediaType()
    const c = tree.addMediaType()

    const aParentResult = tree.addParentToMediaType(b.id, a.id)
    if (aParentResult instanceof Error) {
      expect.fail(`Failed to add parent to media type: ${aParentResult.message}`)
    }

    const bParentResult = tree.addParentToMediaType(c.id, b.id)
    if (bParentResult instanceof Error) {
      expect.fail(`Failed to add parent to media type: ${bParentResult.message}`)
    }

    const addCycleResult = tree.addParentToMediaType(a.id, c.id)
    expect(addCycleResult).toBeInstanceOf(CycleError)
    expect((addCycleResult as unknown as CycleError).cycle).toEqual([a.id, b.id, c.id, a.id])
  })
})
