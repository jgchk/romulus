import { describe, expect } from 'vitest'

import { test } from '../../../../../../vitest-setup'
import { MediaTypeAddedEvent, MediaTypeParentAddedEvent } from './events'
import { CycleError, MediaTypeNotFoundError, MediaTypeTree } from './tree'

describe('addMediaType()', () => {
  test('should add a media type to the tree', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    tree.addMediaType()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toBeInstanceOf(MediaTypeAddedEvent)
    expect((events[0] as MediaTypeAddedEvent).id).toBeTypeOf('number')
  })
})

describe('addParentToMediaType()', () => {
  test('should add a parent to a media type', () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent(1), new MediaTypeAddedEvent(2)])

    // when
    const event = tree.addParentToMediaType(1, 2)
    if (event instanceof Error) {
      expect.fail(`Failed to add parent to media type: ${event.message}`)
    }

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toBeInstanceOf(MediaTypeParentAddedEvent)
    expect((events[0] as MediaTypeParentAddedEvent).childId).toBe(1)
    expect((events[0] as MediaTypeParentAddedEvent).parentId).toBe(2)
  })

  test("should error if the child media type doesn't exist", () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent(1)])

    // when
    const addParentResult = tree.addParentToMediaType(2, 1)

    // then
    expect(addParentResult).toBeInstanceOf(MediaTypeNotFoundError)
    expect((addParentResult as MediaTypeNotFoundError).id).toBe(2)
  })

  test("should error if parent media type doesn't exist", () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent(1)])

    // when
    const addParentResult = tree.addParentToMediaType(1, 2)

    // then
    expect(addParentResult).toBeInstanceOf(MediaTypeNotFoundError)
    expect((addParentResult as MediaTypeNotFoundError).id).toBe(2)
  })

  test('should error when creating a 1-cycle in the tree', () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent(1)])

    // when
    const addParentResult = tree.addParentToMediaType(1, 1)

    // then
    expect(addParentResult).toBeInstanceOf(CycleError)
    expect((addParentResult as CycleError).cycle).toEqual([1, 1])
  })

  test('should error when creating a 2-cycle in the tree', () => {
    // given
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent(1),
      new MediaTypeAddedEvent(2),
      new MediaTypeParentAddedEvent(2, 1),
    ])

    // when
    const addCycleResult = tree.addParentToMediaType(1, 2)

    // then
    expect(addCycleResult).toBeInstanceOf(CycleError)
    expect((addCycleResult as unknown as CycleError).cycle).toEqual([1, 2, 1])
  })

  test('should error when creating a 3-cycle in the tree', () => {
    // given
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent(1),
      new MediaTypeAddedEvent(2),
      new MediaTypeAddedEvent(3),
      new MediaTypeParentAddedEvent(2, 1),
      new MediaTypeParentAddedEvent(3, 2),
    ])

    // when
    const addCycleResult = tree.addParentToMediaType(1, 3)

    // then
    expect(addCycleResult).toBeInstanceOf(CycleError)
    expect((addCycleResult as unknown as CycleError).cycle).toEqual([1, 2, 3, 1])
  })
})
