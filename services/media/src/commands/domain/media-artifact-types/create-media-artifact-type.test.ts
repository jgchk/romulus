import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import {
  mediaArtifactTypeCreatedEvent,
  mediaTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { MediaTypeNotFoundError } from '../media-types/errors.js'
import { createMediaTypesProjectionFromEvents } from '../media-types/media-types-projection.js'
import { createCreateMediaArtifactTypeCommandHandler } from './create-media-artifact-type.js'

it('should create a media artifact type', () => {
  const mediaTypes = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-media-type', name: 'Test Media Type', parents: [] },
    }),
  ])

  const createMediaArtifactType = createCreateMediaArtifactTypeCommandHandler(mediaTypes)

  const result = createMediaArtifactType({
    mediaType: 'test-media-type',
    mediaArtifactType: { id: 'test-id', name: 'Test' },
  })

  expect(result).toEqual(
    ok(
      mediaArtifactTypeCreatedEvent({
        mediaType: 'test-media-type',
        mediaArtifactType: { id: 'test-id', name: 'Test' },
      }),
    ),
  )
})

it('should fail if the media type does not exist', () => {
  const mediaTypes = createMediaTypesProjectionFromEvents([])

  const createMediaArtifactType = createCreateMediaArtifactTypeCommandHandler(mediaTypes)

  const result = createMediaArtifactType({
    mediaType: 'test-media-type',
    mediaArtifactType: { id: 'test-id', name: 'Test' },
  })

  expect(result).toEqual(err(new MediaTypeNotFoundError('test-media-type')))
})
