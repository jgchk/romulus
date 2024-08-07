import { expect } from 'vitest'

import { test } from '../../../vitest-setup'
import { GET } from './+server'

test('should throw an error if no API key is provided', async ({ dbConnection }) => {
  try {
    await GET({
      url: new URL('http://localhost/api/genres'),
      locals: { dbConnection },
      request: new Request('http://localhost/api/genres'),
    })
    expect.fail('Expected an error to be thrown')
  } catch (e) {
    expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
  }
})

test('should throw an error if Bearer auth is malformed', async ({ dbConnection }) => {
  try {
    await GET({
      url: new URL('http://localhost/api/genres'),
      locals: { dbConnection },
      request: new Request('http://localhost/api/genres', {
        headers: { authorization: 'Bearer' },
      }),
    })
    expect.fail('Expected an error to be thrown')
  } catch (e) {
    expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
  }
})

test('should not throw an error if a API key is provided via Bearer', async ({ dbConnection }) => {
  try {
    await GET({
      url: new URL('http://localhost/api/genres'),
      locals: { dbConnection },
      request: new Request('http://localhost/api/genres', {
        headers: { authorization: 'Bearer 000-000-000' },
      }),
    })
  } catch (e) {
    expect.fail('Expected no error to be thrown')
  }
})
