import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import { mediaTypeCreatedEvent } from '../../../common/domain/events.js'
import { mediaTypeUpdatedEvent } from '../../../common/domain/events.js'
import { MediaTypeNotFoundError, MediaTypeTreeCycleError } from './errors.js'
import { createMediaTypesProjectionFromEvents } from './media-types-projection.js'
import { createUpdateMediaTypeCommand } from './update-media-type.js'

it('should update a media type', () => {
  const projection = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({ mediaType: { id: 'test-id', name: 'Test', parents: [] } }),
  ])

  const updateMediaType = createUpdateMediaTypeCommand(projection)

  const result = updateMediaType({
    id: 'test-id',
    update: { name: 'Test (Updated)', parents: [] },
  })

  expect(result).toEqual(
    ok(mediaTypeUpdatedEvent({ id: 'test-id', update: { name: 'Test (Updated)', parents: [] } })),
  )
})

it('should error if the media type does not exist', () => {
  const projection = createMediaTypesProjectionFromEvents([])

  const updateMediaType = createUpdateMediaTypeCommand(projection)

  const result = updateMediaType({ id: 'test-id', update: { name: 'Test (Updated)', parents: [] } })

  expect(result).toEqual(err(new MediaTypeNotFoundError('test-id')))
})

it('should error if a 1-cycle would be created', () => {
  const projection = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({ mediaType: { id: 'test-id', name: 'Test', parents: [] } }),
  ])

  const updateMediaType = createUpdateMediaTypeCommand(projection)

  const result = updateMediaType({
    id: 'test-id',
    update: { name: 'Test (Updated)', parents: ['test-id'] },
  })

  expect(result).toEqual(err(new MediaTypeTreeCycleError(['Test (Updated)', 'Test (Updated)'])))
})

it('should error if a 2-cycle would be created', () => {
  const projection = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({ mediaType: { id: 'parent', name: 'Parent', parents: [] } }),
    mediaTypeCreatedEvent({ mediaType: { id: 'child', name: 'Child', parents: ['parent'] } }),
  ])

  const updateMediaType = createUpdateMediaTypeCommand(projection)

  const result = updateMediaType({
    id: 'parent',
    update: { name: 'Parent (Updated)', parents: ['child'] },
  })

  expect(result).toEqual(
    err(new MediaTypeTreeCycleError(['Parent (Updated)', 'Child', 'Parent (Updated)'])),
  )
})

it('should error if a 3-cycle would be created', () => {
  const projection = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({ mediaType: { id: 'grandparent', name: 'Grandparent', parents: [] } }),
    mediaTypeCreatedEvent({ mediaType: { id: 'parent', name: 'Parent', parents: ['child'] } }),
    mediaTypeCreatedEvent({ mediaType: { id: 'child', name: 'Child', parents: ['grandparent'] } }),
  ])

  const updateMediaType = createUpdateMediaTypeCommand(projection)

  const result = updateMediaType({
    id: 'grandparent',
    update: { name: 'Grandparent (Updated)', parents: ['parent'] },
  })

  expect(result).toEqual(
    err(
      new MediaTypeTreeCycleError([
        'Grandparent (Updated)',
        'Child',
        'Parent',
        'Grandparent (Updated)',
      ]),
    ),
  )
})

it('should error if the parent does not exist', () => {
  const projection = createMediaTypesProjectionFromEvents([
    mediaTypeCreatedEvent({ mediaType: { id: 'test-id', name: 'Test', parents: [] } }),
  ])

  const updateMediaType = createUpdateMediaTypeCommand(projection)

  const result = updateMediaType({
    id: 'test-id',
    update: { name: 'Test (Updated)', parents: ['parent-id'] },
  })

  expect(result).toEqual(err(new MediaTypeNotFoundError('parent-id')))
})
