import { describe, expect } from 'vitest'

import { test } from '../../../../../../vitest-setup'
import { MediaTypeBranches } from './branches'
import {
  MediaTypeAlreadyExistsInBranchError,
  MediaTypeBranchAlreadyExistsError,
  MediaTypeBranchNameInvalidError,
  MediaTypeBranchNotFoundError,
  MediaTypeNotFoundInBranchError,
  WillCreateCycleInMediaTypeTreeError,
} from './errors'
import {
  MediaTypeAddedInBranchEvent,
  MediaTypeBranchCreatedEvent,
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
    expect(events).toHaveLength(1)
    expect(events[0]).toBeInstanceOf(MediaTypeBranchCreatedEvent)
    expect((events[0] as MediaTypeBranchCreatedEvent).id).toBe('branch')
    expect((events[0] as MediaTypeBranchCreatedEvent).name).toBe('Branch')
  })

  test('should trim branch name', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', '   Branch   ')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toBeInstanceOf(MediaTypeBranchCreatedEvent)
    expect((events[0] as MediaTypeBranchCreatedEvent).id).toBe('branch')
    expect((events[0] as MediaTypeBranchCreatedEvent).name).toBe('Branch')
  })

  test('should error if a branch with the given id already exists', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.createBranch('branch', 'Branch2')

    // then
    expect(error).toBeInstanceOf(MediaTypeBranchAlreadyExistsError)
    expect((error as MediaTypeBranchAlreadyExistsError).id).toBe('branch')
  })

  test('should error if the branch name is empty', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', '')

    // then
    expect(error).toBeInstanceOf(MediaTypeBranchNameInvalidError)
    expect((error as MediaTypeBranchNameInvalidError).name).toBe('')
  })

  test('should error if branch name is only whitespace', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', '   ')

    // then
    expect(error).toBeInstanceOf(MediaTypeBranchNameInvalidError)
    expect((error as MediaTypeBranchNameInvalidError).name).toBe('   ')
  })
})

describe('addMediaTypeToBranch()', () => {
  test('should add a media type to the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toBeInstanceOf(MediaTypeAddedInBranchEvent)
    expect((events[0] as MediaTypeAddedInBranchEvent).branchId).toBe('branch')
    expect((events[0] as MediaTypeAddedInBranchEvent).mediaTypeId).toBe('media-type')
  })

  test('should error if the branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type')

    // then
    expect(error).toBeInstanceOf(MediaTypeBranchNotFoundError)
    expect((error as MediaTypeBranchNotFoundError).id).toBe('branch')
  })

  test('should error if the media type already exists in the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'media-type'),
    ])

    // when
    const error = branches.addMediaTypeToBranch('branch', 'media-type')

    // then
    expect(error).toBeInstanceOf(MediaTypeAlreadyExistsInBranchError)
    expect((error as MediaTypeAlreadyExistsInBranchError).branchId).toBe('branch')
    expect((error as MediaTypeAlreadyExistsInBranchError).mediaTypeId).toBe('media-type')
  })
})

describe('removeMediaTypeFromBranch()', () => {
  test('should remove a media type from the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'media-type'),
    ])

    // when
    const error = branches.removeMediaTypeFromBranch('branch', 'media-type')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toBeInstanceOf(MediaTypeRemovedFromBranchEvent)
    expect((events[0] as MediaTypeRemovedFromBranchEvent).branchId).toBe('branch')
    expect((events[0] as MediaTypeRemovedFromBranchEvent).mediaTypeId).toBe('media-type')
  })

  test('should error if the branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.removeMediaTypeFromBranch('branch', 'media-type')

    // then
    expect(error).toBeInstanceOf(MediaTypeBranchNotFoundError)
    expect((error as MediaTypeBranchNotFoundError).id).toBe('branch')
  })

  test('should error if the media type does not exist in the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.removeMediaTypeFromBranch('branch', 'media-type')

    // then
    expect(error).toBeInstanceOf(MediaTypeNotFoundInBranchError)
    expect((error as MediaTypeNotFoundInBranchError).branchId).toBe('branch')
    expect((error as MediaTypeNotFoundInBranchError).mediaTypeId).toBe('media-type')
  })
})

describe('addParentToMediaTypeInBranch()', () => {
  test('should add a parent to a media type in a branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'parent'),
      new MediaTypeAddedInBranchEvent('branch', 'child'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'child', 'parent')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toBeInstanceOf(ParentAddedToMediaTypeInBranchEvent)
    expect((events[0] as ParentAddedToMediaTypeInBranchEvent).branchId).toBe('branch')
    expect((events[0] as ParentAddedToMediaTypeInBranchEvent).childId).toBe('child')
    expect((events[0] as ParentAddedToMediaTypeInBranchEvent).parentId).toBe('parent')
  })

  test('should error if the branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'child', 'parent')

    // then
    expect(error).toBeInstanceOf(MediaTypeBranchNotFoundError)
    expect((error as MediaTypeBranchNotFoundError).id).toBe('branch')
  })

  test('should error if the child media type does not exist in the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'parent'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'child', 'parent')

    // then
    expect(error).toBeInstanceOf(MediaTypeNotFoundInBranchError)
    expect((error as MediaTypeNotFoundInBranchError).branchId).toBe('branch')
    expect((error as MediaTypeNotFoundInBranchError).mediaTypeId).toBe('child')
  })

  test('should error if the parent media type does not exist in the branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'child'),
    ])
    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'child', 'parent')
    // then
    expect(error).toBeInstanceOf(MediaTypeNotFoundInBranchError)
    expect((error as MediaTypeNotFoundInBranchError).branchId).toBe('branch')
    expect((error as MediaTypeNotFoundInBranchError).mediaTypeId).toBe('parent')
  })

  test('should error if a 1-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'media-type'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'media-type', 'media-type')

    // then
    expect(error).toBeInstanceOf(WillCreateCycleInMediaTypeTreeError)
    expect((error as WillCreateCycleInMediaTypeTreeError).branchId).toBe('branch')
    expect((error as WillCreateCycleInMediaTypeTreeError).cycle).toEqual([
      'media-type',
      'media-type',
    ])
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'parent'),
      new MediaTypeAddedInBranchEvent('branch', 'child'),
      new ParentAddedToMediaTypeInBranchEvent('branch', 'child', 'parent'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'parent', 'child')

    // then
    expect(error).toBeInstanceOf(WillCreateCycleInMediaTypeTreeError)
    expect((error as WillCreateCycleInMediaTypeTreeError).branchId).toBe('branch')
    expect((error as WillCreateCycleInMediaTypeTreeError).cycle).toEqual([
      'parent',
      'child',
      'parent',
    ])
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
      new MediaTypeAddedInBranchEvent('branch', 'parent'),
      new MediaTypeAddedInBranchEvent('branch', 'child'),
      new MediaTypeAddedInBranchEvent('branch', 'grandchild'),
      new ParentAddedToMediaTypeInBranchEvent('branch', 'child', 'parent'),
      new ParentAddedToMediaTypeInBranchEvent('branch', 'grandchild', 'child'),
    ])

    // when
    const error = branches.addParentToMediaTypeInBranch('branch', 'parent', 'grandchild')

    // then
    expect(error).toBeInstanceOf(WillCreateCycleInMediaTypeTreeError)
    expect((error as WillCreateCycleInMediaTypeTreeError).branchId).toBe('branch')
    expect((error as WillCreateCycleInMediaTypeTreeError).cycle).toEqual([
      'parent',
      'child',
      'grandchild',
      'parent',
    ])
  })
})

describe('mergeBranches()', () => {
  test('should merge two branches', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('from-branch', 'From Branch'),
      new MediaTypeBranchCreatedEvent('into-branch', 'Into Branch'),
      new MediaTypeAddedInBranchEvent('from-branch', 'media-type'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toBeInstanceOf(MediaTypeBranchesMerged)
    expect((events[0] as MediaTypeBranchesMerged).fromBranchId).toBe('from-branch')
    expect((events[0] as MediaTypeBranchesMerged).intoBranchId).toBe('into-branch')
  })

  test('should error if the from branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('into-branch', 'Into Branch'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')

    // then
    expect(error).toBeInstanceOf(MediaTypeBranchNotFoundError)
    expect((error as MediaTypeBranchNotFoundError).id).toBe('from-branch')
  })

  test('should error if the into branch does not exist', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('from-branch', 'From Branch'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')

    // then
    expect(error).toBeInstanceOf(MediaTypeBranchNotFoundError)
    expect((error as MediaTypeBranchNotFoundError).id).toBe('into-branch')
  })

  test('should error if a 2-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('from-branch', 'From Branch'),
      new MediaTypeBranchCreatedEvent('into-branch', 'Into Branch'),
      new MediaTypeAddedInBranchEvent('from-branch', 'parent'),
      new MediaTypeAddedInBranchEvent('from-branch', 'child'),
      new ParentAddedToMediaTypeInBranchEvent('from-branch', 'child', 'parent'),
      new MediaTypeAddedInBranchEvent('into-branch', 'parent'),
      new MediaTypeAddedInBranchEvent('into-branch', 'child'),
      new ParentAddedToMediaTypeInBranchEvent('into-branch', 'parent', 'child'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')

    // then
    expect(error).toBeInstanceOf(WillCreateCycleInMediaTypeTreeError)
    expect((error as WillCreateCycleInMediaTypeTreeError).branchId).toBe('into-branch')
    expect((error as WillCreateCycleInMediaTypeTreeError).cycle).toEqual([
      'child',
      'parent',
      'child',
    ])
  })

  test('should error if a 3-cycle would be created', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('from-branch', 'From Branch'),
      new MediaTypeBranchCreatedEvent('into-branch', 'Into Branch'),
      new MediaTypeAddedInBranchEvent('from-branch', 'parent'),
      new MediaTypeAddedInBranchEvent('from-branch', 'child'),
      new MediaTypeAddedInBranchEvent('from-branch', 'grandchild'),
      new ParentAddedToMediaTypeInBranchEvent('from-branch', 'child', 'parent'),
      new ParentAddedToMediaTypeInBranchEvent('from-branch', 'grandchild', 'child'),
      new MediaTypeAddedInBranchEvent('into-branch', 'parent'),
      new MediaTypeAddedInBranchEvent('into-branch', 'child'),
      new MediaTypeAddedInBranchEvent('into-branch', 'grandchild'),
      new ParentAddedToMediaTypeInBranchEvent('into-branch', 'parent', 'grandchild'),
    ])

    // when
    const error = branches.mergeBranches('from-branch', 'into-branch')

    // then
    expect(error).toBeInstanceOf(WillCreateCycleInMediaTypeTreeError)
    expect((error as WillCreateCycleInMediaTypeTreeError).branchId).toBe('into-branch')
    expect((error as WillCreateCycleInMediaTypeTreeError).cycle).toEqual([
      'grandchild',
      'parent',
      'child',
      'grandchild',
    ])
  })
})
