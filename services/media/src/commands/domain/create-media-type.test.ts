import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import { mediaTypeCreatedEvent } from '../../common/domain/events.js'
import { createMediaType } from './create-media-type.js'
import { MediaTypeTreeCycleError } from './errors.js'

it('should create a media type', () => {
  const result = createMediaType({ mediaType: { id: 'test-id', name: 'Test', parents: [] } })

  expect(result).toEqual(
    ok(mediaTypeCreatedEvent({ mediaType: { id: 'test-id', name: 'Test', parents: [] } })),
  )
})

it('should error if a 1-cycle would be created', () => {
  const result = createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: ['test-id'] },
  })

  expect(result).toEqual(err(new MediaTypeTreeCycleError(['Test', 'Test'])))
})
