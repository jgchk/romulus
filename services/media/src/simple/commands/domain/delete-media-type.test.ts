import { expect, it } from 'vitest'

import { deleteMediaType, mediaTypeDeletedEvent } from './delete-media-type.js'

it('should delete a media type', () => {
  expect(deleteMediaType({ id: 'test-id' })).toEqual(mediaTypeDeletedEvent({ id: 'test-id' }))
})
