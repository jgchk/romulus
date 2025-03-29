import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { describe, expect, it } from 'vitest'

import { createCreateMediaTypeCommandHandler } from '../application/create-media-type.js'
import { createMediaRouter } from './router.js'

describe('create', () => {
  it('creates a media type', async () => {
    const router = createMediaRouter({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      createMediaType: createCreateMediaTypeCommandHandler(() => {}),
      authentication: {
        whoami: () => okAsync({ id: 0 }),
      },
      authorization: {
        hasPermission: () => Promise.resolve(true),
      },
    })

    const client = testClient(router)

    const response = await client['media-types'].$post(
      { json: { id: 'test', name: 'Test', parents: [] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
  })

  it('returns 403 if user does not have permission', async () => {
    const router = createMediaRouter({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      createMediaType: createCreateMediaTypeCommandHandler(() => {}),
      authentication: {
        whoami: () => okAsync({ id: 0 }),
      },
      authorization: {
        hasPermission: () => Promise.resolve(false),
      },
    })

    const client = testClient(router)

    const response = await client['media-types'].$post(
      { json: { id: 'test', name: 'Test', parents: [] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      success: false,
      error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
    })
  })

  it('returns 400 error if a cycle would be created', async () => {
    const router = createMediaRouter({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      createMediaType: createCreateMediaTypeCommandHandler(() => {}),
      authentication: {
        whoami: () => okAsync({ id: 0 }),
      },
      authorization: {
        hasPermission: () => Promise.resolve(true),
      },
    })

    const client = testClient(router)

    const response = await client['media-types'].$post(
      { json: { id: 'test', name: 'Test', parents: ['test'] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        name: 'MediaTypeTreeCycleError',
        message: 'A cycle would be created in the media type tree: Test -> Test',
        statusCode: 400,
      },
    })
  })
})
