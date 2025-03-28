import { expect } from 'vitest'

import { mediaTypeCreatedEvent } from '../../common/domain/events.js'
import { test } from '../../vitest-setup.js'
import { createGetAllMediaTypesQuery } from './get-all-media-types.js'
import { applyEvent } from './projection.js'

test('should handle the media-type-created event', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'parent', name: 'Parent', parents: [] } }),
  )
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'child', name: 'Child', parents: ['parent'] } }),
  )

  const getAllMediaTypes = createGetAllMediaTypesQuery(dbConnection)

  const result = await getAllMediaTypes()

  expect(result).toEqual([
    { id: 'parent', name: 'Parent', parents: [] },
    { id: 'child', name: 'Child', parents: ['parent'] },
  ])
})
