import { expect, test } from 'vitest'

import { UnauthorizedError } from '../domain/errors.js'
import { MediaTypeTreeNotFoundError } from '../domain/errors.js'
import { MediaTypeTreeAlreadyExistsError, MediaTypeTreeNameInvalidError } from '../domain/errors.js'
import { MediaTypeTreesRole } from '../domain/roles.js'
import { CopyTreeCommand } from './copy-tree.js'
import { CreateTreeCommand } from './create-tree.js'
import { TestHelper } from './test-helper.js'

test('should copy a media type tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('original', 'Original', userId, roles)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should copy a media type tree if the user has the admin role', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([new CreateTreeCommand('original', 'Original', userId, roles)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should error if the original tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const roles = new Set([MediaTypeTreesRole.WRITE])
  const userId = 0

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('original'))
})

test('should error if a tree with the new id already exists', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('original', 'Original', userId, roles),
    new CreateTreeCommand('copy', 'Copy', userId, roles),
  ])

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeAlreadyExistsError('copy'))
})

test('should error if the name is empty', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('original', 'Original', userId, roles)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', '', 'original', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(''))
})

test('should error if the name is only whitespace', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('original', 'Original', userId, roles)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', ' ', 'original', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(' '))
})

test('should error if the name is only newlines', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('original', 'Original', userId, roles)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', '\n\n', 'original', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError('\n\n'))
})

test('should error if the use does not have any roles', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  await t.given([
    new CreateTreeCommand('original', 'Original', userId, new Set([MediaTypeTreesRole.WRITE])),
  ])

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, new Set()))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
