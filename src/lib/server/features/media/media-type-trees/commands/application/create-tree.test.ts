import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import {
  MediaTypeTreeAlreadyExistsError,
  MediaTypeTreeNameInvalidError,
  UnauthorizedError,
} from '../domain/errors'
import { MediaTypeTreePermission } from '../domain/permissions'
import { MemoryTreeRepository } from '../infrastructure/memory-tree-repository'
import { CreateTreeCommand } from './create-tree'
import { executeCommand, given } from './test-helpers'

test('should create a media type tree', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [])

  // when
  const error = await executeCommand(
    repo,
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
  )

  // then
  expect(error).toBeUndefined()
})

test('should create a media type tree with admin permissions', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.ADMIN])
  await given(repo, [])

  // when
  const error = await executeCommand(
    repo,
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the name is empty', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [])

  // when
  const error = await executeCommand(repo, new CreateTreeCommand('tree', '', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(''))
})

test('should error if the name is only whitespace', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [])

  // when
  const error = await executeCommand(repo, new CreateTreeCommand('tree', ' ', userId, permissions))

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError(' '))
})

test('should error if the name is only newlines', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [])

  // when
  const error = await executeCommand(
    repo,
    new CreateTreeCommand('tree', '\n\n', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNameInvalidError('\n\n'))
})

test('should error if a tree with the id already exists', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set([MediaTypeTreePermission.WRITE])
  await given(repo, [new CreateTreeCommand('tree', 'Tree', userId, permissions)])

  // when
  const error = await executeCommand(
    repo,
    new CreateTreeCommand('tree', 'New Tree', userId, permissions),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeAlreadyExistsError('tree'))
})

test('should error if the caller has no permissions', async () => {
  // given
  const repo = new MemoryTreeRepository()
  const userId = 0
  const permissions = new Set<MediaTypeTreePermission>()
  await given(repo, [])

  // when
  const error = await executeCommand(
    repo,
    new CreateTreeCommand('tree', 'Tree', userId, permissions),
  )

  // then
  expect(error).toEqual(new UnauthorizedError())
})
