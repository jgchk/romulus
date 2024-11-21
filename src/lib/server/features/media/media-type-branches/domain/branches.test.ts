import { describe, expect } from 'vitest'

import { test } from '../../../../../../vitest-setup'
import { MediaTypeBranches } from './branches'
import {
  MediaTypeAlreadyExistsInBranchError,
  MediaTypeBranchAlreadyExistsError,
  MediaTypeBranchNameInvalidError,
  MediaTypeBranchNotFoundError,
  MediaTypeNameInvalidError,
  MediaTypeNotFoundInBranchError,
  WillCreateCycleInMediaTypeTreeError,
} from './errors'
import {
  MediaTypeAddedInBranchEvent,
  MediaTypeBranchCreatedEvent,
  MediaTypeBranchedFromAnotherBranchEvent,
  MediaTypeBranchesMerged,
  MediaTypeRemovedFromBranchEvent,
  ParentAddedToMediaTypeInBranchEvent,
} from './events'

describe('createBranch()', () => {
  test('should create a media type branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', 'Branch')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeBranchCreatedEvent('branch', 'Branch')])
  })

  test('should trim branch name', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', '   Branch   ')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeBranchCreatedEvent('branch', 'Branch')])
  })

  test('should remove newlines from branch name', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', 'One \nTwo')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeBranchCreatedEvent('branch', 'One Two')])
  })

  test('should error if a branch with the given id already exists', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.createBranch('branch', 'Branch2')

    // then
    expect(error).toEqual(new MediaTypeBranchAlreadyExistsError('branch'))
  })

  test('should error if the branch name is empty', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', '')

    // then
    expect(error).toEqual(new MediaTypeBranchNameInvalidError(''))
  })

  test('should error if branch name is only whitespace', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', '   ')

    // then
    expect(error).toEqual(new MediaTypeBranchNameInvalidError('   '))
  })

  test('should error if branch name is only newlines', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', '\n\n')

    // then
    expect(error).toEqual(new MediaTypeBranchNameInvalidError('\n\n'))
  })
})

describe('createBranchFromOtherBranch()', () => {
  test('should create a new branch from another branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('base-branch', 'Base Branch'),
    ])

    // when
    const error = branches.createBranchFromOtherBranch('base-branch', 'new-branch', 'New Branch')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeBranchedFromAnotherBranchEvent('base-branch', 'new-branch', 'New Branch'),
    ])
  })

  test('should trim branch name', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('base-branch', 'Base Branch'),
    ])

    // when
    const error = branches.createBranchFromOtherBranch(
      'base-branch',
      'new-branch',
      '   New Branch   ',
    )
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeBranchedFromAnotherBranchEvent('base-branch', 'new-branch', 'New Branch'),
    ])
  })

  test('should remove newlines from branch name', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('base-branch', 'New Branch'),
    ])

    // when
    const error = branches.createBranchFromOtherBranch('base-branch', 'new-branch', 'One \nTwo')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeBranchedFromAnotherBranchEvent('base-branch', 'new-branch', 'One Two'),
    ])
  })

  test('should error if the base branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranchFromOtherBranch('base-branch', 'new-branch', 'New Branch')

    // then
    expect(error).toEqual(new MediaTypeBranchNotFoundError('base-branch'))
  })

  test('should error if the new branch already exists', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('base-branch', 'Base Branch'),
      new MediaTypeBranchCreatedEvent('new-branch', 'New Branch'),
    ])

    // when
    const error = branches.createBranchFromOtherBranch('base-branch', 'new-branch', 'New Branch2')

    // then
    expect(error).toEqual(new MediaTypeBranchAlreadyExistsError('new-branch'))
  })

  test('should error if the branch name is empty', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('base-branch', 'Base Branch'),
    ])

    // when
    const error = branches.createBranchFromOtherBranch('base-branch', 'new-branch', '')

    // then
    expect(error).toEqual(new MediaTypeBranchNameInvalidError(''))
  })

  test('should error if branch name is only whitespace', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('base-branch', 'Base Branch'),
    ])

    // when
    const error = branches.createBranchFromOtherBranch('base-branch', 'new-branch', '   ')

    // then
    expect(error).toEqual(new MediaTypeBranchNameInvalidError('   '))
  })

  test('should error if branch name is only newlines', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('base-branch', 'Base Branch'),
    ])

    // when
    const error = branches.createBranchFromOtherBranch('base-branch', 'new-branch', '\n\n')

    // then
    expect(error).toEqual(new MediaTypeBranchNameInvalidError('\n\n'))
  })
})

describe('addMediaTypeToBranch()', () => {
  test('should add a media type to the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type', 'Media Type')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedInBranchEvent('branch', 'media-type', 'Media Type')])
  })

  test('should trim media type name', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type', '   Media Type    ')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedInBranchEvent('branch', 'media-type', 'Media Type')])
  })

  test('should remove newlines from media type name', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type', 'One \nTwo')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeAddedInBranchEvent('branch', 'media-type', 'One Two')])
  })

  test('should error if the branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type', 'Media Type')

    // then
    expect(error).toEqual(new MediaTypeBranchNotFoundError('branch'))
  })

  test('should error if the media type already exists in the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'media-type', 'Media Type'),
    ])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type', 'Media Type')

    // then
    expect(error).toEqual(new MediaTypeAlreadyExistsInBranchError('branch', 'media-type'))
  })

  test('should error if the media type name is empty', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type', '')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError(''))
  })

  test('should error if media type name is only whitespace', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type', '   ')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError('   '))
  })

  test('should error if media type name is only newlines', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type', '\n\n')

    // then
    expect(error).toEqual(new MediaTypeNameInvalidError('\n\n'))
  })
})

describe('removeMediaTypeFromBranch()', () => {
  test('should remove a media type from the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'media-type', 'Media Type'),
    ])

    // when
    const error = branches.removeMediaTypeFromBranch('branch', 'media-type')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeRemovedFromBranchEvent('branch', 'media-type')])
  })

  test('should error if the branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.removeMediaTypeFromBranch('branch', 'media-type')

    // then
    expect(error).toEqual(new MediaTypeBranchNotFoundError('branch'))
  })

  test('should error if the media type does not exist in the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.removeMediaTypeFromBranch('branch', 'media-type')

    // then
    expect(error).toEqual(new MediaTypeNotFoundInBranchError('branch', 'media-type'))
  })
})

describe('addParentToMediaTypeInBranch()', () => {
  test('should add a parent to a media type in a branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'parent', 'Parent'),
      new MediaTypeAddedInBranchEvent('branch', 'child', 'Child'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'child', 'parent')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new ParentAddedToMediaTypeInBranchEvent('branch', 'child', 'parent')])
  })

  test('should error if the branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'child', 'parent')

    // then
    expect(error).toEqual(new MediaTypeBranchNotFoundError('branch'))
  })

  test('should error if the child media type does not exist in the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'parent', 'Parent'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'child', 'parent')

    // then
    expect(error).toEqual(new MediaTypeNotFoundInBranchError('branch', 'child'))
  })

  test('should error if the parent media type does not exist in the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'child', 'Child'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'child', 'parent')

    // then
    expect(error).toEqual(new MediaTypeNotFoundInBranchError('branch', 'parent'))
  })

  test('should error if a 1-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'media-type', 'Media Type'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'media-type', 'media-type')

    // then
    expect(error).toEqual(
      new WillCreateCycleInMediaTypeTreeError('branch', ['media-type', 'media-type']),
    )
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'parent', 'Parent'),
      new MediaTypeAddedInBranchEvent('branch', 'child', 'Child'),
      new ParentAddedToMediaTypeInBranchEvent('branch', 'child', 'parent'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'parent', 'child')

    // then
    expect(error).toEqual(
      new WillCreateCycleInMediaTypeTreeError('branch', ['parent', 'child', 'parent']),
    )
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'parent', 'Parent'),
      new MediaTypeAddedInBranchEvent('branch', 'child', 'Child'),
      new MediaTypeAddedInBranchEvent('branch', 'grandchild', 'Grandchild'),
      new ParentAddedToMediaTypeInBranchEvent('branch', 'child', 'parent'),
      new ParentAddedToMediaTypeInBranchEvent('branch', 'grandchild', 'child'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'parent', 'grandchild')

    // then
    expect(error).toEqual(
      new WillCreateCycleInMediaTypeTreeError('branch', [
        'parent',
        'child',
        'grandchild',
        'parent',
      ]),
    )
  })
})

describe('mergeBranches()', () => {
  test('should merge two branches', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('from-branch', 'From Branch'),
      new MediaTypeBranchCreatedEvent('into-branch', 'Into Branch'),
      new MediaTypeAddedInBranchEvent('from-branch', 'media-type', 'Media Type'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeBranchesMerged('from-branch', 'into-branch')])
  })

  test('should error if the from branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('into-branch', 'Into Branch'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')

    // then
    expect(error).toEqual(new MediaTypeBranchNotFoundError('from-branch'))
  })

  test('should error if the into branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('from-branch', 'From Branch'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')

    // then
    expect(error).toEqual(new MediaTypeBranchNotFoundError('into-branch'))
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('from-branch', 'From Branch'),
      new MediaTypeBranchCreatedEvent('into-branch', 'Into Branch'),
      new MediaTypeAddedInBranchEvent('from-branch', 'parent', 'Parent'),
      new MediaTypeAddedInBranchEvent('from-branch', 'child', 'Child'),
      new ParentAddedToMediaTypeInBranchEvent('from-branch', 'child', 'parent'),
      new MediaTypeAddedInBranchEvent('into-branch', 'parent', 'Parent'),
      new MediaTypeAddedInBranchEvent('into-branch', 'child', 'Child'),
      new ParentAddedToMediaTypeInBranchEvent('into-branch', 'parent', 'child'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')

    // then
    expect(error).toEqual(
      new WillCreateCycleInMediaTypeTreeError('into-branch', ['child', 'parent', 'child']),
    )
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('from-branch', 'From Branch'),
      new MediaTypeBranchCreatedEvent('into-branch', 'Into Branch'),
      new MediaTypeAddedInBranchEvent('from-branch', 'parent', 'Parent'),
      new MediaTypeAddedInBranchEvent('from-branch', 'child', 'Child'),
      new MediaTypeAddedInBranchEvent('from-branch', 'grandchild', 'Grandchild'),
      new ParentAddedToMediaTypeInBranchEvent('from-branch', 'child', 'parent'),
      new ParentAddedToMediaTypeInBranchEvent('from-branch', 'grandchild', 'child'),
      new MediaTypeAddedInBranchEvent('into-branch', 'parent', 'Parent'),
      new MediaTypeAddedInBranchEvent('into-branch', 'child', 'Child'),
      new MediaTypeAddedInBranchEvent('into-branch', 'grandchild', 'Grandchild'),
      new ParentAddedToMediaTypeInBranchEvent('into-branch', 'parent', 'grandchild'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')

    // then
    expect(error).toEqual(
      new WillCreateCycleInMediaTypeTreeError('into-branch', [
        'grandchild',
        'parent',
        'child',
        'grandchild',
      ]),
    )
  })
})
