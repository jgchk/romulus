import { describe, expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeAlreadyExistsError,
  MediaTypeNameInvalidError,
  MediaTypeNotFoundError,
  WillCreateCycleError,
} from './errors'
import { MediaTypeAddedEvent, MediaTypeRemovedEvent, ParentAddedToMediaTypeEvent } from './events'
import { MediaTypeTree } from './tree'

describe('addMediaType()', () => {
  test('should add a media type to the tree', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', 'Media Type')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedEvent('media-type', 'Media Type')])
  })

  test('should trim media type name', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', '   Media Type    ')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedEvent('media-type', 'Media Type')])
  })

  test('should remove newlines from media type name', () => {
    // given
    const tree = MediaTypeTree.fromEvents([])

    // when
    const error = tree.addMediaType('media-type', 'One \nTwo')
    expect(error).toBeUndefined()

    // then
    const events = tree.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedEvent('media-type', 'One Two')])
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
    expect(events).toEqual([new MediaTypeRemovedEvent('media-type')])
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
    expect(events).toEqual([new ParentAddedToMediaTypeEvent('child', 'parent')])
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
