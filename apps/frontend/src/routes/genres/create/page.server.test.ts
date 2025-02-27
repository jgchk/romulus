import { isHttpError } from '@sveltejs/kit'
import { expect, it } from 'vitest'

import { load } from './+page.server'

it('should return an error message when not logged in', async () => {
  try {
    await load({ locals: { user: undefined } })
    expect.fail('Expected an error')
  } catch (err) {
    if (!isHttpError(err)) expect.fail('Expected an HTTP error')
    expect(err.status).toBe(403)
    expect(err.body).toEqual({ message: 'You do not have permission to create genres' })
  }
})
