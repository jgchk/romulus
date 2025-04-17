import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { expect, it } from 'vitest'

import { mediaTypeCreatedEvent } from '../../../../common/domain/events.js'
import { createUpdateMediaTypeCommandHandler } from '../../../application/media-types/update-media-type.js'
import {
  createDefaultMediaTypesProjection,
  createMediaTypesProjectionFromEvents,
} from '../../../domain/media-types/media-types-projection.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { createAuthorizationMiddleware } from '../../authorization-middleware.js'
import { createBearerAuthMiddleware } from '../../bearer-auth-middleware.js'
import {
  createUpdateMediaTypeRoute,
  type UpdateMediaTypeRouteDependencies,
} from './update-media-type.js'

function setup(options: Partial<UpdateMediaTypeRouteDependencies> = {}) {
  const bearerAuth = createBearerAuthMiddleware({
    whoami: () => okAsync({ id: 0 }),
  })

  const route = createUpdateMediaTypeRoute({
    authz: createAuthorizationMiddleware({
      hasPermission: () => Promise.resolve(true),
    }),
    updateMediaType: createUpdateMediaTypeCommandHandler(
      () => createDefaultMediaTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),

    ...options,
  })

  const router = new Hono().use(bearerAuth).put('/:id', ...route)

  const client = testClient(router)

  return { client }
}

it('updates a media type', async () => {
  const { client } = setup({
    updateMediaType: createUpdateMediaTypeCommandHandler(
      () =>
        createMediaTypesProjectionFromEvents([
          mediaTypeCreatedEvent({
            mediaType: { id: 'test', name: 'Test', parents: [] },
            userId: 0,
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),
  })

  const response = await client[':id'].$put(
    { param: { id: 'test' }, json: { name: 'Test (Updated)', parents: [] } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ success: true })
})

it('returns 403 if user does not have permission', async () => {
  const { client } = setup({
    authz: createAuthorizationMiddleware({
      hasPermission: (userId, permission) => {
        if (permission === MediaPermission.WriteMediaTypes) {
          return Promise.resolve(false)
        } else {
          return Promise.resolve(true)
        }
      },
    }),
  })

  const response = await client[':id'].$put(
    { param: { id: 'test' }, json: { name: 'Test (Updated)', parents: [] } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(403)
  expect(await response.json()).toEqual({
    success: false,
    error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
  })
})

it('returns 422 error if a cycle would be created', async () => {
  const { client } = setup({
    updateMediaType: createUpdateMediaTypeCommandHandler(
      () =>
        createMediaTypesProjectionFromEvents([
          mediaTypeCreatedEvent({
            mediaType: { id: 'test', name: 'Test', parents: [] },
            userId: 0,
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),
  })

  const response = await client[':id'].$put(
    { param: { id: 'test' }, json: { name: 'Test (Updated)', parents: ['test'] } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(422)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'MediaTypeTreeCycleError',
      message: 'A cycle would be created in the media type tree: Test (Updated) -> Test (Updated)',
      statusCode: 422,
    },
  })
})

it('returns 404 error if the media type does not exist', async () => {
  const { client } = setup({
    updateMediaType: createUpdateMediaTypeCommandHandler(
      () => createMediaTypesProjectionFromEvents([]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),
  })

  const response = await client[':id'].$put(
    { param: { id: 'test' }, json: { name: 'Test (Updated)', parents: [] } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(404)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'MediaTypeNotFoundError',
      message: "Media type with ID 'test' not found",
      statusCode: 404,
    },
  })
})
