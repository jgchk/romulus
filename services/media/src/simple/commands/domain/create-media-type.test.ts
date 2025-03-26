import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import { createMediaType, mediaTypeCreatedEvent } from './create-media-type.js'
import { MediaTypeTreeCycleError } from './errors.js'
import { type MediaType } from './types.js'

it('should create a media type', () => {
  const mediaType: MediaType = { id: 'test-id', name: 'Test', parents: [] }

  expect(createMediaType({ mediaType })).toEqual(ok(mediaTypeCreatedEvent({ mediaType })))
})

it('should error if a 1-cycle would be created', () => {
  expect(
    createMediaType({
      mediaType: { id: 'test-id', name: 'Test', parents: ['test-id'] },
    }),
  ).toEqual(err(new MediaTypeTreeCycleError(['Test', 'Test'])))
})
