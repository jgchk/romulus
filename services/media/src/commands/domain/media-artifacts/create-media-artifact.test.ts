import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import { mediaArtifactCreatedEvent } from '../../../common/domain/events.js'
import { mediaArtifactTypeCreatedEvent } from '../../../common/domain/events.js'
import { MediaArtifactTypeNotFoundError } from '../media-artifact-types/errors.js'
import { createMediaArtifactTypesProjectionFromEvents } from '../media-artifact-types/media-artifact-types-projection.js'
import { createCreateMediaArtifactCommandHandler } from './create-media-artifact.js'

it('should create a media artifact when media artifact type exists', () => {
  const projection = createMediaArtifactTypesProjectionFromEvents([
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'artifact-type-id', name: 'Test Artifact Type', mediaTypes: [] },
      userId: 0,
    }),
  ])

  const createMediaArtifact = createCreateMediaArtifactCommandHandler(projection)

  const result = createMediaArtifact({
    mediaArtifact: { id: 'test-id', name: 'Test Artifact', mediaArtifactType: 'artifact-type-id' },
    userId: 0,
  })

  expect(result).toEqual(
    ok(
      mediaArtifactCreatedEvent({
        mediaArtifact: {
          id: 'test-id',
          name: 'Test Artifact',
          mediaArtifactType: 'artifact-type-id',
        },
        userId: 0,
      }),
    ),
  )
})

it('should error if the media artifact type does not exist', () => {
  const projection = createMediaArtifactTypesProjectionFromEvents([])

  const createMediaArtifact = createCreateMediaArtifactCommandHandler(projection)

  const result = createMediaArtifact({
    mediaArtifact: { id: 'test-id', name: 'Test Artifact', mediaArtifactType: 'non-existent-type' },
    userId: 0,
  })

  expect(result).toEqual(err(new MediaArtifactTypeNotFoundError('non-existent-type')))
})
