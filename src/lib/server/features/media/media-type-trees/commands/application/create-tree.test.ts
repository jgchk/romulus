import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreePermission } from '../domain/roles'
import {
  MediaTypeTreeAlreadyExistsError,
  MediaTypeTreeNameInvalidError,
} from '../domain/tree/errors'
import { CreateTreeCommand } from './create-tree'
import { TestHelper } from './test-helper'

test('should create a media type tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', 'Tree', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should create a media type tree with admin permissions', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.ADMIN])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', 'Tree', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should error if the name is empty', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', '', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(''))
})

test('should error if the name is only whitespace', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', ' ', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(' '))
})

test('should error if the name is only newlines', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', '\n\n', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError('\n\n'))
})

test('should error if a tree with the id already exists', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await t.when(new CreateTreeCommand('tree', 'New Tree', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeAlreadyExistsError('tree'))
})

test('should error if the caller has no permissions', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set<MediaTypeTreePermission>()
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', 'Tree', userId, permissions))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
