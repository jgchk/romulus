import { expect } from 'vitest'

import { test } from '../../../../vitest-setup'
import { load } from './+page.server'

test('should throw error if account id is not a number', async ({ dbConnection }) => {
  try {
    await load({ params: { id: 'test' }, locals: { dbConnection } })
    expect.fail('should throw error')
  } catch (e) {
    expect(e).toEqual({ status: 400, body: { message: 'Invalid account ID' } })
  }
})

test('should throw error if account does not exist', async ({ dbConnection }) => {
  try {
    await load({ params: { id: '1' }, locals: { dbConnection } })
    expect.fail('should throw error')
  } catch (e) {
    expect(e).toEqual({ status: 404, body: { message: 'Account not found' } })
  }
})
