import { expect } from 'vitest'

import { test } from '../../../vitest-setup'
import { GET } from './+server'

test('should throw an error if no API key is provided', async ({ dbConnection }) => {
  try {
    await GET({ url: new URL('http://localhost/api/genres'), locals: { dbConnection } })
    expect.fail('Expected an error to be thrown')
  } catch (e) {
    expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
  }
})
