import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import { mediaTypeCreatedEvent } from '../../../common/domain/events.js'
import { createCreateMediaTypeCommandHandler } from './create-media-type.js'
import { MediaTypeNotFoundError, MediaTypeTreeCycleError } from './errors.js'
import { createMediaTypesProjectionFromEvents } from './media-types-projection.js'

it('should create a media type', () => {
  const createMediaType = createCreateMediaTypeCommandHandler(
    createMediaTypesProjectionFromEvents([]),
  )

  const result = createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: [] },
    userId: 0,
  })

  expect(result).toEqual(
    ok(
      mediaTypeCreatedEvent({ mediaType: { id: 'test-id', name: 'Test', parents: [] }, userId: 0 }),
    ),
  )
})

it('should error if a 1-cycle would be created', () => {
  const createMediaType = createCreateMediaTypeCommandHandler(
    createMediaTypesProjectionFromEvents([]),
  )

  const result = createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: ['test-id'] },
    userId: 0,
  })

  expect(result).toEqual(err(new MediaTypeTreeCycleError(['Test', 'Test'])))
})

it('should error if the parent does not exist', () => {
  const createMediaType = createCreateMediaTypeCommandHandler(
    createMediaTypesProjectionFromEvents([]),
  )

  const result = createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: ['parent-id'] },
    userId: 0,
  })

  expect(result).toEqual(err(new MediaTypeNotFoundError('parent-id')))
})
