import { expect, it } from 'vitest'

import { GET } from './+server'

it('returns 200 success', async () => {
  const response = GET()
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ success: true })
})
