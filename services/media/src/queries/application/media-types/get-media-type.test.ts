import { expect } from 'vitest'

import { mediaTypeCreatedEvent } from '../../../common/domain/events.js'
import { test } from '../../../vitest-setup.js'
import { applyEvent } from '../projection.js'
import { createGetMediaTypeQueryHandler } from './get-media-type.js'

test('should return the media type if it exists', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] }, userId: 0 }),
  )

  const getMediaType = createGetMediaTypeQueryHandler(dbConnection)

  const result = await getMediaType('test')

  expect(result).toEqual({ id: 'test', name: 'Test', parents: [] })
})

test('should return undefined if the media type does not exist', async ({ dbConnection }) => {
  const getMediaType = createGetMediaTypeQueryHandler(dbConnection)

  const result = await getMediaType('non-existing')

  expect(result).toBeUndefined()
})
