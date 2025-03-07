import { expect, test } from 'vitest'

import { MediaTypeTreeNotFoundError } from '../domain/errors.js'
import { MediaTypeTreesRole } from '../domain/roles.js'
import { CreateTreeCommand } from './create-tree.js'
import { RequestMergeTreesCommand } from './request-merge.js'
import { TestHelper } from './test-helper.js'

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
