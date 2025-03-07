import { expect, test } from 'vitest'

import { MediaTypeTreeNotFoundError, UnauthorizedError } from '../domain/errors.js'
import { MediaTypeTreesRole } from '../domain/roles.js'
import { CreateTreeCommand } from './create-tree.js'
import { SetMainTreeCommand } from './set-main-tree.js'
import { TestHelper } from './test-helper.js'

test('should set the main tree id', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, roles)])

  // when
  const error = await t.when(new SetMainTreeCommand('tree', userId, roles))

  // then
  expect(error).toBeUndefined()
})

test('should error if the tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.ADMIN])
  await t.given([])

  // when
  const error = await t.when(new SetMainTreeCommand('tree', userId, roles))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should error if the user does not have the admin role', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, roles)])

  // when
  const error = await t.when(new SetMainTreeCommand('tree', userId, roles))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
