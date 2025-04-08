import { expect, it } from 'vitest'

import { mediaTypeCreatedEvent, mediaTypeDeletedEvent } from '../../../common/domain/events.js'
import { mediaTypeUpdatedEvent } from '../../../common/domain/events.js'
import { applyMediaTypeEvent } from './media-types-projection.js'

it('should add a genre upon media-type-created event', () => {
  const result = applyMediaTypeEvent(
    { mediaTypes: new Map() },
    mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
  )

  expect(result).toEqual({
    mediaTypes: new Map([['test', { id: 'test', name: 'Test', parents: [] }]]),
  })
})

it('should delete a genre upon media-type-deleted event', () => {
  const result = applyMediaTypeEvent(
    { mediaTypes: new Map([['test', { id: 'test', name: 'Test', parents: [] }]]) },
    mediaTypeDeletedEvent({ id: 'test' }),
  )

  expect(result).toEqual({
    mediaTypes: new Map(),
  })
})

it('should update a genre upon media-type-updated event', () => {
  const result = applyMediaTypeEvent(
    { mediaTypes: new Map([['test', { id: 'test', name: 'Test', parents: [] }]]) },
    mediaTypeUpdatedEvent({ id: 'test', update: { name: 'Test (Updated)', parents: [] } }),
  )

  expect(result).toEqual({
    mediaTypes: new Map([['test', { id: 'test', name: 'Test (Updated)', parents: [] }]]),
  })
})
