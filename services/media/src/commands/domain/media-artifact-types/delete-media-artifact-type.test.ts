import { expect, it } from 'vitest'

import { mediaArtifactTypeDeletedEvent } from '../../../common/domain/events.js'
import { deleteMediaArtifactType } from './delete-media-artifact-type.js'

it('should delete a media artifact type', () => {
  expect(deleteMediaArtifactType({ id: 'test-id', userId: 0 })).toEqual(
    mediaArtifactTypeDeletedEvent({ id: 'test-id', userId: 0 }),
  )
})
