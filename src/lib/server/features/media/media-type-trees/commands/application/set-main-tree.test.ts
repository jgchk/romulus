import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { MediaTypeTreeNotFoundError, UnauthorizedError } from '../domain/errors'
import { MediaTypeTreePermission } from '../domain/roles'
import { CreateTreeCommand } from './create-tree'
import { SetMainTreeCommand } from './set-main-tree'
import { TestHelper } from './test-helper'

test('should set the main tree id', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.ADMIN])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await t.when(new SetMainTreeCommand('tree', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should error if the tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.ADMIN])
  await t.given([])

  // when
  const error = await t.when(new SetMainTreeCommand('tree', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('tree'))
})

test('should error if the user does not have the admin role', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await t.when(new SetMainTreeCommand('tree', userId, permissions))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
