import { expect, test } from 'vitest'

import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { MediaTypeNotFoundError, WillCreateCycleError } from '../domain/errors'
import { MediaTypeTreesRole } from '../domain/roles'
import { AddMediaTypeCommand } from './add-media-type'
import { AddParentToMediaTypeCommand } from './add-parent-to-media-type'
import { CreateTreeCommand } from './create-tree'
import { SetMainTreeCommand } from './set-main-tree'
import { TestHelper } from './test-helper'

test('should add a parent to a media type', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, roles),
  )

  // then
  expect(error).toBeUndefined()
})

test("should add a parent to a media type in another user's tree if the user has the admin role", async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const adminRoles = new Set([MediaTypeTreesRole.ADMIN])
  const regularUserId = 1
  const regularUserRoles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', regularUserId, regularUserRoles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', regularUserId, regularUserRoles),
    new AddMediaTypeCommand('tree', 'child', 'Child', regularUserId, regularUserRoles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', adminUserId, adminRoles),
  )

  // then
  expect(error).toBeUndefined()
})

test('should add a parent to a media type in the main tree if the user has the admin role', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, roles),
    new SetMainTreeCommand('tree', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, roles),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if adding a parent to a media type in the main tree if the user does not have the admin role', async () => {
  // given
  const t = new TestHelper()
  const adminUserId = 0
  const adminRoles = new Set([MediaTypeTreesRole.ADMIN])
  const regularUserId = 1
  const regularUserRoles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', regularUserId, regularUserRoles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', regularUserId, regularUserRoles),
    new AddMediaTypeCommand('tree', 'child', 'Child', regularUserId, regularUserRoles),
    new SetMainTreeCommand('tree', adminUserId, adminRoles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', regularUserId, regularUserRoles),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})

test('should error if the child media type does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, roles),
  )

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('child'))
})

test('should error if the parent media type does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, roles),
  )

  // then
  expect(error).toEqual(new MediaTypeNotFoundError('parent'))
})

test('should error if a 1-cycle would be created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'media-type', 'Media Type', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'media-type', 'media-type', userId, roles),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['media-type', 'media-type']))
})

test('should error if a 2-cycle would be created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, roles),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'parent', 'child', userId, roles),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'parent']))
})

test('should error if a 3-cycle would be created', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, roles),
    new AddMediaTypeCommand('tree', 'grandchild', 'Grandchild', userId, roles),
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, roles),
    new AddParentToMediaTypeCommand('tree', 'grandchild', 'child', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'parent', 'grandchild', userId, roles),
  )

  // then
  expect(error).toEqual(new WillCreateCycleError(['parent', 'child', 'grandchild', 'parent']))
})

test('should error if the media type tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, roles),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should error if the user does not have any roles', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', userId, new Set()),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})

test('should error if the user does not own the tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const otherUserId = 1
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('tree', 'Tree', userId, roles),
    new AddMediaTypeCommand('tree', 'parent', 'Parent', userId, roles),
    new AddMediaTypeCommand('tree', 'child', 'Child', userId, roles),
  ])

  // when
  const error = await t.when(
    new AddParentToMediaTypeCommand('tree', 'child', 'parent', otherUserId, roles),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})
