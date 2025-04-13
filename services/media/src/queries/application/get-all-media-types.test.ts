import { expect } from 'vitest'

import { mediaTypeCreatedEvent } from '../../common/domain/events.js'
import { test } from '../../vitest-setup.js'
import { createGetAllMediaTypesQueryHandler } from './get-all-media-types.js'
import { applyEvent } from './projection.js'

test('should get all media types', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'parent', name: 'Parent', parents: [] } }),
  )
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'child', name: 'Child', parents: ['parent'] } }),
  )

  const getAllMediaTypes = createGetAllMediaTypesQueryHandler(dbConnection)

  const result = await getAllMediaTypes()

  expect(result).toEqual([
    { id: 'parent', name: 'Parent', parents: [] },
    { id: 'child', name: 'Child', parents: ['parent'] },
  ])
})
