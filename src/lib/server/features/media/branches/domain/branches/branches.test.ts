import { describe, expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { MediaTypeBranches } from './branches'
import {
  MediaTypeBranchAlreadyExistsError,
  MediaTypeBranchNameInvalidError,
  MediaTypeBranchNotFoundError,
} from './errors'
import { MediaTypeBranchCreatedEvent, MediaTypeBranchedFromAnotherBranchEvent } from './events'

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
    const error = branches.createBranch('branch', ' Branch ')
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

  test('should error if the branch already exists', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch'),
    ])

    // when
    const error = branches.createBranch('branch', 'Branch')

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
    const error = branches.createBranchFromOtherBranch('base-branch', 'new-branch', ' New Branch ')
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
      new MediaTypeBranchCreatedEvent('base-branch', 'Base Branch'),
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
    const error = branches.createBranchFromOtherBranch('base-branch', 'new-branch', 'New Branch')

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
