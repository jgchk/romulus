import { expect } from 'vitest'

import { test } from '../../../../../../vitest-setup'
import { MediaTypeTreeNotFoundError } from '../domain/errors'
import { MediaTypeTreesRole } from '../domain/roles'
import { CreateTreeCommand } from './create-tree'
import { RequestMergeTreesCommand } from './request-merge'
import { TestHelper } from './test-helper'

test('should request a merge between two trees', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([
    new CreateTreeCommand('source', 'Source', userId, roles),
    new CreateTreeCommand('target', 'Target', userId, roles),
  ])

  // when
  const error = await t.when(
    new RequestMergeTreesCommand('merge-request-id', 'source', 'target', userId, roles),
  )

  // then
  expect(error).toBeUndefined()
})

test('should error if the source branch does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('target', 'Target', userId, roles)])

  // when
  const error = await t.when(
    new RequestMergeTreesCommand('merge-request-id', 'source', 'target', userId, roles),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('source'))
})

test('should error if the target branch does not exist', async () => {
  // given
  const t = new TestHelper()
  const userId = 0
  const roles = new Set([MediaTypeTreesRole.WRITE])
  await t.given([new CreateTreeCommand('source', 'Source', userId, roles)])

  // when
  const error = await t.when(
    new RequestMergeTreesCommand('merge-request-id', 'source', 'target', userId, roles),
  )

  // then
  expect(error).toEqual(new MediaTypeTreeNotFoundError('target'))
})
