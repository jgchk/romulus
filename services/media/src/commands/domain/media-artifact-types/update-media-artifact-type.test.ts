import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import {
  mediaArtifactTypeCreatedEvent,
  mediaArtifactTypeUpdatedEvent,
  mediaTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { MediaTypeNotFoundError } from '../media-types/errors.js'
import { createMediaTypesProjectionFromEvents } from '../media-types/media-types-projection.js'
import { MediaArtifactTypeNotFoundError } from './errors.js'
import { createMediaArtifactTypesProjectionFromEvents } from './media-artifact-types-projection.js'
import { createUpdateMediaArtifactTypeCommandHandler } from './update-media-artifact-type.js'

it('should update a media artifact type', () => {
  const mediaTypes = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-media-type', name: 'Test Media Type', parents: [] },
    }),
  ])
  const mediaArtifactTypes = createMediaArtifactTypesProjectionFromEvents([
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: ['test-media-type'] },
    }),
  ])

  const updateMediaArtifactType = createUpdateMediaArtifactTypeCommandHandler({
    mediaTypes,
    mediaArtifactTypes,
  })

  const result = updateMediaArtifactType({
    id: 'test',
    update: { name: 'Test (Updated)', mediaTypes: ['test-media-type'] },
  })

  expect(result).toEqual(
    ok(
      mediaArtifactTypeUpdatedEvent({
        id: 'test',
        update: { name: 'Test (Updated)', mediaTypes: ['test-media-type'] },
      }),
    ),
  )
})

it('should fail if the media artifact type does not exist', () => {
  const mediaTypes = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-media-type', name: 'Test Media Type', parents: [] },
    }),
  ])
  const mediaArtifactTypes = createMediaArtifactTypesProjectionFromEvents([])

  const updateMediaArtifactType = createUpdateMediaArtifactTypeCommandHandler({
    mediaTypes,
    mediaArtifactTypes,
  })

  const result = updateMediaArtifactType({
    id: 'test',
    update: { name: 'Test (Updated)', mediaTypes: ['test-media-type'] },
  })

  expect(result).toEqual(err(new MediaArtifactTypeNotFoundError('test')))
})

it('should fail if the media type does not exist', () => {
  const mediaTypes = createMediaTypesProjectionFromEvents([])
  const mediaArtifactTypes = createMediaArtifactTypesProjectionFromEvents([
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: ['test-media-type'] },
    }),
  ])

  const updateMediaArtifactType = createUpdateMediaArtifactTypeCommandHandler({
    mediaTypes,
    mediaArtifactTypes,
  })

  const result = updateMediaArtifactType({
    id: 'test',
    update: { name: 'Test (Updated)', mediaTypes: ['test-media-type'] },
  })

  expect(result).toEqual(err(new MediaTypeNotFoundError('test-media-type')))
})
