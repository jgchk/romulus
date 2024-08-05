import { expect } from 'vitest'

import { test } from '../../../../vitest-setup'
import { load } from './+page.server'

test('should throw error if account id is not a number', () => {
  try {
    load({ params: { id: 'test' } })
    expect.fail('should throw error')
  } catch (e) {
    expect(e).toEqual({ status: 400, body: { message: 'Invalid account ID' } })
  }
})
