import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import {
  mediaArtifactTypeCreatedEvent,
  type MediaArtifactTypeEvent,
  mediaArtifactTypeUpdatedEvent,
  mediaTypeCreatedEvent,
  type MediaTypeEvent,
} from '../../../common/domain/events.js'
import { MemoryEventStore } from '../../../common/infrastructure/memory-event-store.js'
import { MediaArtifactTypeNotFoundError } from '../../domain/media-artifact-types/errors.js'
import { MediaTypeNotFoundError } from '../../domain/media-types/errors.js'
import {
  createGetMediaArtifactTypes,
  createSaveMediaArtifactTypeEvent,
} from '../../infrastructure/media-artifact-types.js'
import { createGetMediaTypes } from '../../infrastructure/media-types.js'
import { createUpdateMediaArtifactTypeCommandHandler } from './update-media-artifact-type.js'

it('should update a media artifact type', async () => {
  const eventStore = new MemoryEventStore<{
    'media-types': MediaTypeEvent
    'media-artifact-types': MediaArtifactTypeEvent
  }>()

  eventStore.save('media-types', [
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-media-type', name: 'Test Media Type', parents: [] },
    }),
  ])
  eventStore.save('media-artifact-types', [
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: ['test-media-type'] },
    }),
  ])

  const updateMediaArtifactType = createUpdateMediaArtifactTypeCommandHandler({
    getMediaTypes: createGetMediaTypes(eventStore),
    getMediaArtifactTypes: createGetMediaArtifactTypes(eventStore),
    saveMediaArtifactTypeEvent: createSaveMediaArtifactTypeEvent(eventStore),
  })

  const result = await updateMediaArtifactType({
    id: 'test',
    update: {
      name: 'Test',
      mediaTypes: ['test-media-type'],
    },
  })

  expect(result).toEqual(ok(undefined))

  const events = eventStore.get('media-artifact-types')
  expect(events).toEqual([
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: ['test-media-type'] },
    }),
    mediaArtifactTypeUpdatedEvent({
      id: 'test',
      update: { name: 'Test', mediaTypes: ['test-media-type'] },
    }),
  ])
})

it('should fail if the media artifact type does not exist', async () => {
  const eventStore = new MemoryEventStore<{
    'media-types': MediaTypeEvent
    'media-artifact-types': MediaArtifactTypeEvent
  }>()

  eventStore.save('media-types', [
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-media-type', name: 'Test Media Type', parents: [] },
    }),
  ])

  const updateMediaArtifactType = createUpdateMediaArtifactTypeCommandHandler({
    getMediaTypes: createGetMediaTypes(eventStore),
    getMediaArtifactTypes: createGetMediaArtifactTypes(eventStore),
    saveMediaArtifactTypeEvent: createSaveMediaArtifactTypeEvent(eventStore),
  })

  const result = await updateMediaArtifactType({
    id: 'test',
    update: {
      name: 'Test',
      mediaTypes: ['test-media-type'],
    },
  })

  expect(result).toEqual(err(new MediaArtifactTypeNotFoundError('test')))

  const events = eventStore.get('media-artifact-types')
  expect(events).toEqual([])
})

it('should fail if the media type does not exist', async () => {
  const eventStore = new MemoryEventStore<{
    'media-types': MediaTypeEvent
    'media-artifact-types': MediaArtifactTypeEvent
  }>()

  eventStore.save('media-artifact-types', [
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: ['test-media-type'] },
    }),
  ])

  const updateMediaArtifactType = createUpdateMediaArtifactTypeCommandHandler({
    getMediaTypes: createGetMediaTypes(eventStore),
    getMediaArtifactTypes: createGetMediaArtifactTypes(eventStore),
    saveMediaArtifactTypeEvent: createSaveMediaArtifactTypeEvent(eventStore),
  })

  const result = await updateMediaArtifactType({
    id: 'test',
    update: {
      name: 'Test',
      mediaTypes: ['test-media-type'],
    },
  })

  expect(result).toEqual(err(new MediaTypeNotFoundError('test-media-type')))

  const events = eventStore.get('media-artifact-types')
  expect(events).toEqual([
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: ['test-media-type'] },
    }),
  ])
})
