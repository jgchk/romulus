import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import {
  mediaArtifactSchemaCreatedEvent,
  mediaTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { MediaTypeNotFoundError } from '../media-types/errors.js'
import { createMediaTypesProjectionFromEvents } from '../media-types/media-types-projection.js'
import { createCreateMediaArtifactSchemaCommandHandler } from './create-media-artifact-schema.js'
import { MediaArtifactSchemaNotFoundError } from './errors.js'
import { createMediaArtifactSchemasProjectionFromEvents } from './media-artifact-schema-projection.js'

it('should create a media artifact schema', () => {
  const mediaTypes = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-media-type', name: 'Test Media Type', parents: [] },
    }),
  ])

  const mediaArtifactSchemas = createMediaArtifactSchemasProjectionFromEvents([])

  const createMediaArtifactSchema = createCreateMediaArtifactSchemaCommandHandler(
    mediaTypes,
    mediaArtifactSchemas,
  )

  const result = createMediaArtifactSchema({
    mediaType: 'test-media-type',
    schema: { id: 'test-id', name: 'Test', parent: undefined },
  })

  expect(result).toEqual(
    ok(
      mediaArtifactSchemaCreatedEvent({
        mediaType: 'test-media-type',
        schema: { id: 'test-id', name: 'Test', parent: undefined },
      }),
    ),
  )
})

it('should fail if the media type does not exist', () => {
  const mediaTypes = createMediaTypesProjectionFromEvents([])

  const mediaArtifactSchemas = createMediaArtifactSchemasProjectionFromEvents([])

  const createMediaArtifactSchema = createCreateMediaArtifactSchemaCommandHandler(
    mediaTypes,
    mediaArtifactSchemas,
  )

  const result = createMediaArtifactSchema({
    mediaType: 'test-media-type',
    schema: { id: 'test-id', name: 'Test', parent: undefined },
  })

  expect(result).toEqual(err(new MediaTypeNotFoundError('test-media-type')))
})

it('should fail if the media type parent does not exist', () => {
  const mediaTypes = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-media-type', name: 'Test Media Type', parents: [] },
    }),
  ])

  const mediaArtifactSchemas = createMediaArtifactSchemasProjectionFromEvents([])

  const createMediaArtifactSchema = createCreateMediaArtifactSchemaCommandHandler(
    mediaTypes,
    mediaArtifactSchemas,
  )

  const result = createMediaArtifactSchema({
    mediaType: 'test-media-type',
    schema: { id: 'test-id', name: 'Test', parent: 'parent-id' },
  })

  expect(result).toEqual(err(new MediaArtifactSchemaNotFoundError('parent-id')))
})
