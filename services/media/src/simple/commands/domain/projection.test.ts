import { expect, it } from 'vitest'

import { mediaTypeCreatedEvent } from './create-media-type.js'
import { applyEvent } from './projection.js'

it('should add a genre upon media-type-created event', () => {
  expect(
    applyEvent(
      { mediaTypes: new Map() },
      mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
    ),
  ).toEqual({
    mediaTypes: new Map([['test', { id: 'test', name: 'Test', parents: [] }]]),
  })
})
