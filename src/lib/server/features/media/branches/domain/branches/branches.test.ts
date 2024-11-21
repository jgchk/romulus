import { describe, expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { MediaTypeBranches } from './branches'
import {
  MediaTypeBranchAlreadyExistsError,
  MediaTypeBranchNameInvalidError,
  MediaTypeBranchNotFoundError,
} from './errors'
import { MediaTypeBranchCreatedEvent } from './events'

describe('createBranch()', () => {
  test('should create a media type branch', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', 'Branch')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeBranchCreatedEvent('branch', 'Branch', undefined)])
  })

  test('should create a branch from another branch', () => {
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('base-branch', 'Base Branch', undefined),
    ])

    const error = branches.createBranch('new-branch', 'New Branch', 'base-branch')
    expect(error).toBeUndefined()

    const events = branches.getUncommittedEvents()
    expect(events).toEqual([
      new MediaTypeBranchCreatedEvent('new-branch', 'New Branch', 'base-branch'),
    ])
  })

  test('should trim branch name', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', ' Branch ')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeBranchCreatedEvent('branch', 'Branch', undefined)])
  })

  test('should remove newlines from branch name', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([])

    // when
    const error = branches.createBranch('branch', 'One \nTwo')
    expect(error).toBeUndefined()

    // then
    const events = branches.getUncommittedEvents()
    expect(events).toEqual([new MediaTypeBranchCreatedEvent('branch', 'One Two', undefined)])
  })

  test('should error if the branch already exists', () => {
    // given
    const branches = MediaTypeBranches.fromEvents([
      new MediaTypeBranchCreatedEvent('branch', 'Branch', undefined),
    ])

    // when
    const error = branches.createBranch('branch', 'Branch')

    // then
    expect(error).toEqual(new MediaTypeBranchAlreadyExistsError('branch'))
  })

  test('should error if the base branch does not exist', () => {
    const branches = MediaTypeBranches.fromEvents([])

    const error = branches.createBranch('new-branch', 'New Branch', 'base-branch')

    expect(error).toEqual(new MediaTypeBranchNotFoundError('base-branch'))
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
