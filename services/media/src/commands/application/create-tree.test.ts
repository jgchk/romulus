import { expect, test } from 'vitest'

import { UnauthorizedError } from '../domain/errors.js'
import { MediaTypeTreeAlreadyExistsError, MediaTypeTreeNameInvalidError } from '../domain/errors.js'
import { MediaTypeTreesRole } from '../domain/roles.js'
import { CreateTreeCommand } from './create-tree.js'
import { TestHelper } from './test-helper.js'

test('should create a media type tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', 'Tree', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should create a media type tree with the admin role', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', 'Tree', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should error if the name is empty', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', '', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(''))
})

test('should error if the name is only whitespace', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', ' ', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(' '))
})

test('should error if the name is only newlines', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', '\n\n', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError('\n\n'))
})

test('should error if a tree with the id already exists', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, roles)])

  // when
  const error = await t.when(new CreateTreeCommand('tree', 'New Tree', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeAlreadyExistsError('tree'))
})

test('should error if the caller has no roles', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set<MediaTypeTreesRole>()
  await t.given([])

  // when
  const error = await t.when(new CreateTreeCommand('tree', 'Tree', userId, roles))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
