import { describe, expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeAlreadyExistsError,
  MediaTypeNameInvalidError,
  MediaTypeNotFoundError,
  MediaTypeTreeNameInvalidError,
  WillCreateCycleError,
} from './errors'
import {
  MediaTypeAddedEvent,
  MediaTypeRemovedEvent,
  MediaTypeTreeNamedEvent,
  MediaTypeTreesMergedEvent,
  ParentAddedToMediaTypeEvent,
} from './events'
import { MediaTypeTree } from './tree'

const expectUuid = expect.stringMatching(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
) as string

describe('setName()', () => {
  test('should set the tree name', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.setName('Tree')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreeNamedEvent('Tree')])
  })

  test('should trim name', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.setName(' Tree ')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreeNamedEvent('Tree')])
  })

  test('should remove newlines from name', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.setName('One \nTwo')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreeNamedEvent('One Two')])
  })

  test('should error if the name is empty', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.setName('')

    // then
    expect(error).toEqual(new MediaTypeTreeNameInvalidError(''))
  })

  test('should error if the name is only whitespace', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.setName('   ')

    // then
    expect(error).toEqual(new MediaTypeTreeNameInvalidError('   '))
  })

  test('should error if the name is only newlines', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.setName('\n\n')

    // then
    expect(error).toEqual(new MediaTypeTreeNameInvalidError('\n\n'))
  })
})

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
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'commit-1'),
    ])

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

  test('should error if the media type name is only whitespace', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', '   ')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError('   '))
  })

  test('should error if the media type name is only newlines', () => {
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
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'commit-1'),
    ])

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
      new MediaTypeAddedEvent('parent', 'Parent', 'commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'commit-2'),
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
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent('parent', 'Parent', 'commit-1')])

    // when
    const error = tree.addParentToMediaType('child', 'parent')

    // then
    expect(error).toEqual(new MediaTypeNotFoundError('child'))
  })

  test('should error if the parent media type does not exist', () => {
    // given
    const tree = MediaTypeTree.fromEvents([new MediaTypeAddedEvent('child', 'Child', 'commit-1')])

    // when
    const error = tree.addParentToMediaType('child', 'parent')

    // then
    expect(error).toEqual(new MediaTypeNotFoundError('parent'))
  })

  test('should error if a 1-cycle would be created', () => {
    // given
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'commit-1'),
    ])

    // when
    const error = tree.addParentToMediaType('media-type', 'media-type')

    // then
    expect(error).toEqual(new WillCreateCycleError(['media-type', 'media-type']))
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'commit-2'),
      new ParentAddedToMediaTypeEvent('child', 'parent', 'commit-3'),
    ])

    // when
    const error = tree.addParentToMediaType('parent', 'child')

    // then
    expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'parent']))
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const tree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'commit-2'),
      new MediaTypeAddedEvent('grandchild', 'Grandchild', 'commit-3'),
      new ParentAddedToMediaTypeEvent('child', 'parent', 'commit-4'),
      new ParentAddedToMediaTypeEvent('grandchild', 'child', 'commit-5'),
    ])

    // when
    const error = tree.addParentToMediaType('parent', 'grandchild')

    // then
    expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'grandchild', 'parent']))
  })
})

describe('merge()', () => {
  test('should merge a tree with an empty tree', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'source-commit-1'),
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
        {
          id: 'source-commit-1',
          parents: [],
        },
        expectUuid,
      ),
    ])
  })

  test('should merge two trees with no conflicts', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type-1', 'Media Type 1', 'source-commit-1'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type-2', 'Media Type 2', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeTreesMergedEvent(
        [{ action: 'added', id: 'media-type-1', name: 'Media Type 1' }],
        {
          id: 'source-commit-1',
          parents: [],
        },
        expectUuid,
      ),
    ])
  })

  test('should merge two trees with a new parent-child relationship', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'base-commit-2'),
    ])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'base-commit-2'),
      new ParentAddedToMediaTypeEvent('child', 'parent', 'source-commit-1'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'base-commit-2'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeTreesMergedEvent(
        [{ action: 'parent-added', childId: 'child', parentId: 'parent' }],
        {
          id: 'source-commit-1',
          parents: [{ id: 'base-commit-2', parents: [{ id: 'base-commit-1', parents: [] }] }],
        },
        expectUuid,
      ),
    ])
  })

  test('should do nothing when merging two empty trees', () => {
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

  test('should do nothing when merging an empty tree with a tree', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([])
    const sourceTree = MediaTypeTree.fromEvents([])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([])
  })

  test('should do nothing when merging two trees with no changes', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'base-commit-1'),
    ])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'base-commit-1'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'base-commit-1'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([])
  })

  test('should error if a media type already exists in both trees', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'source-commit-1'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('media-type', 'Media Type', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)

    // then
    expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'base-commit-2'),
    ])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'base-commit-2'),
      new ParentAddedToMediaTypeEvent('child', 'parent', 'source-commit-1'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'base-commit-2'),
      new ParentAddedToMediaTypeEvent('parent', 'child', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)

    // then
    expect(error).toEqual(new WillCreateCycleError(['child', 'parent', 'child']))
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const baseTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'base-commit-2'),
      new MediaTypeAddedEvent('grandchild', 'Grandchild', 'base-commit-3'),
    ])
    const sourceTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'base-commit-2'),
      new MediaTypeAddedEvent('grandchild', 'Grandchild', 'base-commit-3'),
      new ParentAddedToMediaTypeEvent('child', 'parent', 'source-commit-1'),
      new ParentAddedToMediaTypeEvent('grandchild', 'child', 'source-commit-2'),
    ])
    const targetTree = MediaTypeTree.fromEvents([
      new MediaTypeAddedEvent('parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('child', 'Child', 'base-commit-2'),
      new MediaTypeAddedEvent('grandchild', 'Grandchild', 'base-commit-3'),
      new ParentAddedToMediaTypeEvent('parent', 'grandchild', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge(sourceTree, baseTree)

    // then
    expect(error).toEqual(new WillCreateCycleError(['grandchild', 'parent', 'child', 'grandchild']))
  })
})
