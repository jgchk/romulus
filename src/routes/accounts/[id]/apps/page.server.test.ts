import { expect } from 'vitest'

import { test } from '../../../../vitest-setup'
import { load } from './+page.server'

test('should throw error if not logged in', async ({ dbConnection }) => {
  try {
    await load({ params: { id: '1' }, locals: { dbConnection, user: undefined } })
    expect.fail('should throw error')
  } catch (e) {
    expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
  }
})

test('should throw error if account is not the one currently logged in', async ({
  dbConnection,
}) => {
  try {
    await load({ params: { id: '1' }, locals: { dbConnection, user: { id: 2 } } })
    expect.fail('should throw error')
  } catch (e) {
    expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
  }
})

test('should throw error if account id is not a number', async ({ dbConnection }) => {
  try {
    await load({ params: { id: 'test' }, locals: { dbConnection, user: { id: 1 } } })
    expect.fail('should throw error')
  } catch (e) {
    expect(e).toEqual({ status: 400, body: { message: 'Invalid account ID' } })
  }
})

test('should throw error if account does not exist', async ({ dbConnection }) => {
  try {
    await load({ params: { id: '1' }, locals: { dbConnection, user: { id: 1 } } })
    expect.fail('should throw error')
  } catch (e) {
    expect(e).toEqual({ status: 404, body: { message: 'Account not found' } })
  }
})
