import { expect } from 'vitest'

import { mediaTypeUpdatedEvent } from '../../common/domain/events.js'
import { mediaTypeCreatedEvent, mediaTypeDeletedEvent } from '../../common/domain/events.js'
import { test } from '../../vitest-setup.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { applyEvent } from './projection.js'

test('should handle the media-type-created event', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
  )

  const mediaType = await getMediaTypeById(dbConnection, 'test')
  expect(mediaType).toEqual({ id: 'test', name: 'Test', parents: [] })
})

test('should handle the media-type-updated event', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
  )

  await applyEvent(
    dbConnection,
    mediaTypeUpdatedEvent({ id: 'test', update: { name: 'Test (Update)', parents: [] } }),
  )

  const mediaType = await getMediaTypeById(dbConnection, 'test')
  expect(mediaType).toEqual({ id: 'test', name: 'Test (Update)', parents: [] })
})

test('should handle the media-type-deleted event', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
  )

  await applyEvent(dbConnection, mediaTypeDeletedEvent({ id: 'test' }))

  const mediaType = await getMediaTypeById(dbConnection, 'test')
  expect(mediaType).toBeUndefined()
})

async function getMediaTypeById(dbConnection: IDrizzleConnection, id: string) {
  return await dbConnection.query.mediaTypes.findFirst({
    where: (mediaTypes, { eq }) => eq(mediaTypes.id, id),
    with: {
      parents: true,
    },
  })
}
