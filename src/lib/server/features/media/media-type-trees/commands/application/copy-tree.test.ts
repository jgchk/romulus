import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { UnauthorizedError } from '../domain/errors'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { MediaTypeTreePermission } from '../domain/roles'
import {
  MediaTypeTreeAlreadyExistsError,
  MediaTypeTreeNameInvalidError,
} from '../domain/tree/errors'
import { CopyTreeCommand } from './copy-tree'
import { CreateTreeCommand } from './create-tree'
import { TestHelper } from './test-helper'

test('should copy a media type tree', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should copy a media type tree if the user has admin permissions', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.ADMIN])
  await t.given([new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, permissions))

  // then
  expect(error).toBeUndefined()
})

test('should error if the original tree does not exist', async () => {
  // given
  const t = new TestHelper()
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  const userId = 0

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('original'))
})

test('should error if a tree with the new id already exists', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([
    new CreateTreeCommand('original', 'Original', userId, permissions),
    new CreateTreeCommand('copy', 'Copy', userId, permissions),
  ])

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeAlreadyExistsError('copy'))
})

test('should error if the name is empty', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', '', 'original', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(''))
})

test('should error if the name is only whitespace', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', ' ', 'original', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(' '))
})

test('should error if the name is only newlines', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await t.given([new CreateTreeCommand('original', 'Original', userId, permissions)])

  // when
  const error = await t.when(new CopyTreeCommand('copy', '\n\n', 'original', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError('\n\n'))
})

test('should error if the use does not have any permissions', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  await t.given([
    new CreateTreeCommand('original', 'Original', userId, new Set([MediaTypeTreePermission.WRITE])),
  ])

  // when
  const error = await t.when(new CopyTreeCommand('copy', 'Copy', 'original', userId, new Set()))

  // then
  expect(error).toEqual(new UnauthorizedError())
})
