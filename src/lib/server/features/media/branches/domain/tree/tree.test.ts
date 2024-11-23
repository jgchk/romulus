import { describe, expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeAlreadyExistsError,
  MediaTypeNameInvalidError,
  MediaTypeNotFoundError,
  WillCreateCycleError,
} from './errors'
import {
  MediaTypeAddedEvent,
  MediaTypeRemovedEvent,
  MediaTypeTreesMergedEvent,
  ParentAddedToMediaTypeEvent,
} from './events'
import { MediaTypeTree } from './tree'

const expectUuid = expect.any(String) as string

describe('addMediaType()', () => {
  test('should add a media type to the tree', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', 'Media Type')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedEvent('media-type', 'Media Type', expectUuid)])
  })

  test('should trim media type name', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', '   Media Type    ')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedEvent('media-type', 'Media Type', expectUuid)])
  })

  test('should remove newlines from media type name', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', 'One \nTwo')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedEvent('media-type', 'One Two', expectUuid)])
  })

  test('should error if the media type already exists', () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent('media-type', 'Media Type')])

    // when
    const error = tree.addMediaType('media-type', 'Media Type')

    // then
    expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
  })

  test('should error if the media type name is empty', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', '')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError(''))
  })

  test('should error if media type name is only whitespace', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', '   ')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError('   '))
  })

  test('should error if media type name is only newlines', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', '\n\n')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError('\n\n'))
  })
})

describe('removeMediaType()', () => {
  test('should remove a media type from the tree', () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent('media-type', 'Media Type')])

    // when
    const error = tree.removeMediaType('media-type')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeRemovedEvent('media-type', expectUuid)])
  })

  test('should error if the media type does not exist', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.removeMediaType('media-type')

    // then
    expect(error).toEqual(new MediaTypeNotFoundError('media-type'))
  })
})

describe('addParentToMediaType()', () => {
  test('should add a parent to a media type', () => {
    // given
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
    ])

    // when
    const error = tree.addParentToMediaType('child', 'parent')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new ParentAddedToMediaTypeEvent('child', 'parent', expectUuid)])
  })

  test('should error if the child media type does not exist', () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent('parent', 'Parent')])

    // when
    const error = tree.addParentToMediaType('child', 'parent')

    // then
    expect(error).toEqual(new MediaTypeNotFoundError('child'))
  })

  test('should error if the parent media type does not exist', () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent('child', 'Child')])

    // when
    const error = tree.addParentToMediaType('child', 'parent')

    // then
    expect(error).toEqual(new MediaTypeNotFoundError('parent'))
  })

  test('should error if a 1-cycle would be created', () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent('media-type', 'Media Type')])

    // when
    const error = tree.addParentToMediaType('media-type', 'media-type')

    // then
    expect(error).toEqual(new WillCreateCycleError(['media-type', 'media-type']))
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
      new ParentAddedToMediaTypeEvent('child', 'parent'),
    ])

    // when
    const error = tree.addParentToMediaType('parent', 'child')

    // then
    expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'parent']))
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
      new MediaTypeAddedEvent('grandchild', 'Grandchild'),
      new ParentAddedToMediaTypeEvent('child', 'parent'),
      new ParentAddedToMediaTypeEvent('grandchild', 'child'),
    ])

    // when
    const error = tree.addParentToMediaType('parent', 'grandchild')

    // then
    expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'grandchild', 'parent']))
  })
})

describe('merge()', () => {
  test('should merge two empty trees', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([])
    const sourceTree = MediaTypeTree.fromEvents([])
    const targetTree = MediaTypeTree.fromEvents([])

    // when
    const error = targetTree.merge(sourceTree, baseTree)
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([])
  })

  test('should merge a tree with an empty tree', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type'),
    ])
    const targetTree = MediaTypeTree.fromEvents([])

    // when
    const error = targetTree.merge(sourceTree, baseTree)
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeTreesMergedEvent(
        [{ action: 'added', id: 'media-type', name: 'Media Type' }],
        expectUuid,
      ),
    ])
  })

  test('should merge an empty tree with a tree', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([])
    const sourceTree = MediaTypeTree.fromEvents([])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([])
  })

  test('should merge two trees with no conflicts', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type-1', 'Media Type 1'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type-2', 'Media Type 2'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeTreesMergedEvent(
        [{ action: 'added', id: 'media-type-1', name: 'Media Type 1' }],
        expectUuid,
      ),
    ])
  })

  test('should error if a media type already exists in both trees', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)

    // then
    expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
  })

  test('should merge two trees with a new parent-child relationship', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
    ])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
      new ParentAddedToMediaTypeEvent('child', 'parent'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeTreesMergedEvent(
        [{ action: 'parent-added', childId: 'child', parentId: 'parent' }],
        expectUuid,
      ),
    ])
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
    ])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
      new ParentAddedToMediaTypeEvent('child', 'parent'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
      new ParentAddedToMediaTypeEvent('parent', 'child'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)

    // then
    expect(error).toEqual(new WillCreateCycleError(['child', 'parent', 'child']))
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
      new MediaTypeAddedEvent('grandchild', 'Grandchild'),
    ])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
      new MediaTypeAddedEvent('grandchild', 'Grandchild'),
      new ParentAddedToMediaTypeEvent('child', 'parent'),
      new ParentAddedToMediaTypeEvent('grandchild', 'child'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent'),
      new MediaTypeAddedEvent('child', 'Child'),
      new MediaTypeAddedEvent('grandchild', 'Grandchild'),
      new ParentAddedToMediaTypeEvent('parent', 'grandchild'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)

    // then
    expect(error).toEqual(new WillCreateCycleError(['grandchild', 'parent', 'child', 'grandchild']))
  })
})
