import { describe, expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeAddedEvent,
  MediaTypeMergeRequestedEvent,
  MediaTypeRemovedEvent,
  MediaTypeTreeCreatedEvent,
  MediaTypeTreesMergedEvent,
  ParentAddedToMediaTypeEvent,
} from '../../shared/domain/events'
import {
  MediaTypeAlreadyExistsError,
  MediaTypeMergeRequestNotFoundError,
  MediaTypeNameInvalidError,
  MediaTypeNotFoundError,
  MediaTypeTreeNameInvalidError,
  MediaTypeTreeNotFoundError,
  WillCreateCycleError,
} from './errors'
import { MediaTypeTree } from './tree'

const expectUuid = expect.stringMatching(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
) as string

describe('create()', () => {
  test('should set the tree name', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [])

    // when
    const error = tree.create('Tree', undefined, 0)
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0)])
  })

  test('should trim name', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [])

    // when
    const error = tree.create(' Tree ', undefined, 0)
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0)])
  })

  test('should remove newlines from name', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [])

    // when
    const error = tree.create('One \nTwo', undefined, 0)
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreeCreatedEvent('tree', 'One Two', undefined, 0)])
  })

  test('should error if the name is empty', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [])

    // when
    const error = tree.create('', undefined, 0)

    // then
    expect(error).toEqual(new MediaTypeTreeNameInvalidError(''))
  })

  test('should error if the name is only whitespace', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [])

    // when
    const error = tree.create('   ', undefined, 0)

    // then
    expect(error).toEqual(new MediaTypeTreeNameInvalidError('   '))
  })

  test('should error if the name is only newlines', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [])

    // when
    const error = tree.create('\n\n', undefined, 0)

    // then
    expect(error).toEqual(new MediaTypeTreeNameInvalidError('\n\n'))
  })
})

describe('addMediaType()', () => {
  test('should add a media type to the tree', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
    ])

    // when
    const error = tree.addMediaType('media-type', 'Media Type')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeAddedEvent('tree', 'media-type', 'Media Type', expectUuid),
    ])
  })

  test('should trim media type name', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
    ])

    // when
    const error = tree.addMediaType('media-type', '   Media Type    ')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeAddedEvent('tree', 'media-type', 'Media Type', expectUuid),
    ])
  })

  test('should remove newlines from media type name', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
    ])

    // when
    const error = tree.addMediaType('media-type', 'One \nTwo')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedEvent('tree', 'media-type', 'One Two', expectUuid)])
  })

  test('should error if the media type already exists', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
      new MediaTypeAddedEvent('tree', 'media-type', 'Media Type', 'commit-1'),
    ])

    // when
    const error = tree.addMediaType('media-type', 'Media Type')

    // then
    expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
  })

  test('should error if the media type name is empty', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
    ])

    // when
    const error = tree.addMediaType('media-type', '')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError(''))
  })

  test('should error if the media type name is only whitespace', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
    ])

    // when
    const error = tree.addMediaType('media-type', '   ')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError('   '))
  })

  test('should error if the media type name is only newlines', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
    ])

    // when
    const error = tree.addMediaType('media-type', '\n\n')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError('\n\n'))
  })
})

describe('removeMediaType()', () => {
  test('should remove a media type from the tree', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
      new MediaTypeAddedEvent('tree', 'media-type', 'Media Type', 'commit-1'),
    ])

    // when
    const error = tree.removeMediaType('media-type')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeRemovedEvent('tree', 'media-type', expectUuid)])
  })

  test('should error if the media type does not exist', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
    ])

    // when
    const error = tree.removeMediaType('media-type')

    // then
    expect(error).toEqual(new MediaTypeNotFoundError('media-type'))
  })
})

describe('addParentToMediaType()', () => {
  test('should add a parent to a media type', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
      new MediaTypeAddedEvent('tree', 'parent', 'Parent', 'commit-1'),
      new MediaTypeAddedEvent('tree', 'child', 'Child', 'commit-2'),
    ])

    // when
    const error = tree.addParentToMediaType('child', 'parent')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new ParentAddedToMediaTypeEvent('tree', 'child', 'parent', expectUuid)])
  })

  test('should error if the child media type does not exist', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
      new MediaTypeAddedEvent('tree', 'parent', 'Parent', 'commit-1'),
    ])

    // when
    const error = tree.addParentToMediaType('child', 'parent')

    // then
    expect(error).toEqual(new MediaTypeNotFoundError('child'))
  })

  test('should error if the parent media type does not exist', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
      new MediaTypeAddedEvent('tree', 'child', 'Child', 'commit-1'),
    ])

    // when
    const error = tree.addParentToMediaType('child', 'parent')

    // then
    expect(error).toEqual(new MediaTypeNotFoundError('parent'))
  })

  test('should error if a 1-cycle would be created', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
      new MediaTypeAddedEvent('tree', 'media-type', 'Media Type', 'commit-1'),
    ])

    // when
    const error = tree.addParentToMediaType('media-type', 'media-type')

    // then
    expect(error).toEqual(new WillCreateCycleError(['media-type', 'media-type']))
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
      new MediaTypeAddedEvent('tree', 'parent', 'Parent', 'commit-1'),
      new MediaTypeAddedEvent('tree', 'child', 'Child', 'commit-2'),
      new ParentAddedToMediaTypeEvent('tree', 'child', 'parent', 'commit-3'),
    ])

    // when
    const error = tree.addParentToMediaType('parent', 'child')

    // then
    expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'parent']))
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
      new MediaTypeAddedEvent('tree', 'parent', 'Parent', 'commit-1'),
      new MediaTypeAddedEvent('tree', 'child', 'Child', 'commit-2'),
      new MediaTypeAddedEvent('tree', 'grandchild', 'Grandchild', 'commit-3'),
      new ParentAddedToMediaTypeEvent('tree', 'child', 'parent', 'commit-4'),
      new ParentAddedToMediaTypeEvent('tree', 'grandchild', 'child', 'commit-5'),
    ])

    // when
    const error = tree.addParentToMediaType('parent', 'grandchild')

    // then
    expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'grandchild', 'parent']))
  })

  test.only('should not throw a cycle error based on removed relationships', () => {
    // given
    const tree = MediaTypeTree.fromEvents('tree', [
      new MediaTypeTreeCreatedEvent('tree', 'Tree', undefined, 0),
      new MediaTypeAddedEvent('tree', 'parent', 'Parent', 'commit-1'),
      new MediaTypeAddedEvent('tree', 'child', 'Child', 'commit-2'),
      new ParentAddedToMediaTypeEvent('tree', 'child', 'parent', 'commit-3'),
      new MediaTypeRemovedEvent('tree', 'child', 'commit-4'),
      new MediaTypeAddedEvent('tree', 'child', 'Child', 'commit-5'),
    ])

    // when
    const error = tree.addParentToMediaType('parent', 'child')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new ParentAddedToMediaTypeEvent('tree', 'parent', 'child', expectUuid)])
  })
})

describe('merge()', () => {
  test('should merge a tree with an empty tree', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
      new MediaTypeAddedEvent('source', 'media-type', 'Media Type', 'source-commit-1'),
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
    ])

    // when
    const error = targetTree.merge('source')
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreesMergedEvent('source', 'target', expectUuid)])
  })

  test('should merge two trees with no conflicts', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
      new MediaTypeAddedEvent('source', 'media-type-1', 'Media Type 1', 'source-commit-1'),
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
      new MediaTypeAddedEvent('target', 'media-type-2', 'Media Type 2', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge('source')
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreesMergedEvent('source', 'target', expectUuid)])
  })

  test('should merge two trees with a new parent-child relationship', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('base', 'Base', undefined, 0),
      new MediaTypeAddedEvent('base', 'parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('base', 'child', 'Child', 'base-commit-2'),
      new MediaTypeTreeCreatedEvent('source', 'Source', 'base', 0),
      new ParentAddedToMediaTypeEvent('source', 'child', 'parent', 'source-commit-1'),
      new MediaTypeTreeCreatedEvent('target', 'Target', 'base', 0),
    ])

    // when
    const error = targetTree.merge('source')
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreesMergedEvent('source', 'target', expectUuid)])
  })

  test('should merge two empty trees', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
    ])

    // when
    const error = targetTree.merge('source')
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreesMergedEvent('source', 'target', expectUuid)])
  })

  test('should merge an empty tree with a tree', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
      new MediaTypeAddedEvent('target', 'media-type', 'Media Type', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge('source')
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreesMergedEvent('source', 'target', expectUuid)])
  })

  test('should merge two trees with no changes', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('base', 'Base', undefined, 0),
      new MediaTypeAddedEvent('base', 'media-type', 'Media Type', 'base-commit-1'),
      new MediaTypeTreeCreatedEvent('source', 'Source', 'base', 0),
      new MediaTypeTreeCreatedEvent('target', 'Target', 'base', 0),
    ])

    // when
    const error = targetTree.merge('source')
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeTreesMergedEvent('source', 'target', expectUuid)])
  })

  test('should error if a media type already exists in both trees', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
      new MediaTypeAddedEvent('source', 'media-type', 'Media Type', 'source-commit-1'),
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
      new MediaTypeAddedEvent('target', 'media-type', 'Media Type', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge('source')

    // then
    expect(error).toEqual(new MediaTypeAlreadyExistsError('media-type'))
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('base', 'Base', undefined, 0),
      new MediaTypeAddedEvent('base', 'parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('base', 'child', 'Child', 'base-commit-2'),

      new MediaTypeTreeCreatedEvent('source', 'Source', 'base', 0),
      new ParentAddedToMediaTypeEvent('source', 'child', 'parent', 'source-commit-1'),

      new MediaTypeTreeCreatedEvent('target', 'Target', 'base', 0),
      new ParentAddedToMediaTypeEvent('target', 'parent', 'child', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge('source')

    // then
    expect(error).toEqual(new WillCreateCycleError(['child', 'parent', 'child']))
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('base', 'Base', undefined, 0),
      new MediaTypeAddedEvent('base', 'parent', 'Parent', 'base-commit-1'),
      new MediaTypeAddedEvent('base', 'child', 'Child', 'base-commit-2'),
      new MediaTypeAddedEvent('base', 'grandchild', 'Grandchild', 'base-commit-3'),

      new MediaTypeTreeCreatedEvent('source', 'Source', 'base', 0),
      new ParentAddedToMediaTypeEvent('source', 'child', 'parent', 'source-commit-1'),
      new ParentAddedToMediaTypeEvent('source', 'grandchild', 'child', 'source-commit-2'),

      new MediaTypeTreeCreatedEvent('target', 'Target', 'base', 0),
      new ParentAddedToMediaTypeEvent('target', 'parent', 'grandchild', 'target-commit-1'),
    ])

    // when
    const error = targetTree.merge('source')

    // then
    expect(error).toEqual(new WillCreateCycleError(['grandchild', 'parent', 'child', 'grandchild']))
  })

  test('should merge if a merge request is found', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
      new MediaTypeMergeRequestedEvent('merge-request-id', 'source', 'target', 0),
    ])

    // when
    const error = targetTree.merge('source', 'merge-request-id')
    expect(error).toBeUndefined()

    // then
    const events = targetTree.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeTreesMergedEvent('source', 'target', expectUuid, 'merge-request-id'),
    ])
  })

  test('should error if attempting to close a merge request that does not exist', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
    ])

    // when
    const error = targetTree.merge('source', 'merge-request-id')

    // then
    expect(error).toEqual(new MediaTypeMergeRequestNotFoundError('merge-request-id'))
  })

  test('should error if merging a merge request that has already been merged', () => {
    // given
    const targetTree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
      new MediaTypeMergeRequestedEvent('merge-request-id', 'source', 'target', 0),
      new MediaTypeTreesMergedEvent('source', 'target', 'merge-commit', 'merge-request-id'),
    ])

    // when
    const error = targetTree.merge('source', 'merge-request-id')

    // then
    expect(error).toEqual(new MediaTypeMergeRequestNotFoundError('merge-request-id'))
  })
})

describe('requestMerge()', () => {
  test('should request a merge between two trees', () => {
    // given
    const tree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
    ])

    // when
    const error = tree.requestMerge('merge-request-id', 'source', 0)
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeMergeRequestedEvent('merge-request-id', 'source', 'target', 0),
    ])
  })

  test('should error if the source tree does not exist', () => {
    // given
    const tree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('target', 'Target', undefined, 0),
    ])

    // when
    const error = tree.requestMerge('merge-request-id', 'source', 0)

    // then
    expect(error).toEqual(new MediaTypeTreeNotFoundError('source'))
  })

  test('should error if the target tree does not exist', () => {
    // given
    const tree = MediaTypeTree.fromEvents('target', [
      new MediaTypeTreeCreatedEvent('source', 'Source', undefined, 0),
    ])

    // when
    const error = tree.requestMerge('merge-request-id', 'source', 0)

    // then
    expect(error).toEqual(new MediaTypeTreeNotFoundError('target'))
  })
})
