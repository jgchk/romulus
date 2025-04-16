import { expect } from 'vitest'

import { mediaTypeCreatedEvent } from '../../../common/domain/events.js'
import { test } from '../../../vitest-setup.js'
import { applyEvent } from '../projection.js'
import { createGetAllMediaTypesQueryHandler } from './get-all-media-types.js'

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
    { id: 'child', name: 'Child', parents: ['parent'] },
    { id: 'parent', name: 'Parent', parents: [] },
  ])
})

test('should sort media types in alphabetical order', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'b', name: 'B', parents: [] } }),
  )
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'a', name: 'A', parents: [] } }),
  )

  const getAllMediaTypes = createGetAllMediaTypesQueryHandler(dbConnection)

  const result = await getAllMediaTypes()

  expect(result).toEqual([
    { id: 'a', name: 'A', parents: [] },
    { id: 'b', name: 'B', parents: [] },
  ])
})
