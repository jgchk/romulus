import { expect } from 'vitest'

import { mediaArtifactTypeCreatedEvent } from '../../../common/domain/events.js'
import { test } from '../../../vitest-setup.js'
import { applyEvent } from '../projection.js'
import { createGetMediaArtifactTypeQueryHandler } from './get-media-artifact-type.js'

test('should return the media artifact type if it exists', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
      userId: 0,
    }),
  )

  const getMediaArtifactType = createGetMediaArtifactTypeQueryHandler(dbConnection)

  const result = await getMediaArtifactType('painting')

  expect(result).toEqual({ id: 'painting', name: 'Painting', mediaTypes: [] })
})

test('should return undefined if the media artifact type does not exist', async ({
  dbConnection,
}) => {
  const getMediaArtifactType = createGetMediaArtifactTypeQueryHandler(dbConnection)

  const result = await getMediaArtifactType('non-existing')

  expect(result).toBeUndefined()
})
