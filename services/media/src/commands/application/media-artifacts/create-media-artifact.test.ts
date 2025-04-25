import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import {
  mediaArtifactCreatedEvent,
  type MediaArtifactEvent,
  mediaArtifactTypeCreatedEvent,
  type MediaArtifactTypeEvent,
} from '../../../common/domain/events.js'
import { MemoryEventStore } from '../../../common/infrastructure/memory-event-store.js'
import { MediaArtifactTypeNotFoundError } from '../../domain/media-artifact-types/errors.js'
import { createGetMediaArtifactTypes } from '../../infrastructure/media-artifact-types.js'
import { createSaveMediaArtifactEvent } from '../../infrastructure/media-artifacts.js'
import { createCreateMediaTypeCommandHandler } from './create-media-artifact.js'

it('should create a media artifact', async () => {
  // Setup event store
  const eventStore = new MemoryEventStore<{
    'media-artifact-types': MediaArtifactTypeEvent
    [key: `media-artifact-id-${string}`]: MediaArtifactEvent
  }>()

  // Add test events to the store
  eventStore.save('media-artifact-types', [
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'artifact-type-id', name: 'Test Artifact Type', mediaTypes: [] },
      userId: 0,
    }),
  ])

  // Create the command handler
  const createMediaArtifact = createCreateMediaTypeCommandHandler(
    createGetMediaArtifactTypes(eventStore),
    createSaveMediaArtifactEvent(eventStore),
  )

  // Execute the command
  const result = await createMediaArtifact({
    mediaArtifact: { id: 'test-id', name: 'Test Artifact', mediaArtifactType: 'artifact-type-id' },
    userId: 123,
  })

  // Verify result
  expect(result).toEqual(ok(undefined))

  // Verify events were saved correctly
  const events = eventStore.get('media-artifact-id-test-id')
  expect(events.map((event) => event.eventData)).toEqual([
    mediaArtifactCreatedEvent({
      mediaArtifact: {
        id: 'test-id',
        name: 'Test Artifact',
        mediaArtifactType: 'artifact-type-id',
      },
      userId: 123,
    }),
  ])
})

it('should fail if the media artifact type does not exist', async () => {
  // Setup event store
  const eventStore = new MemoryEventStore<{
    'media-artifact-types': MediaArtifactTypeEvent
    [key: `media-artifact-id-${string}`]: MediaArtifactEvent
  }>()

  // Create the command handler
  const createMediaArtifact = createCreateMediaTypeCommandHandler(
    createGetMediaArtifactTypes(eventStore),
    createSaveMediaArtifactEvent(eventStore),
  )

  // Execute the command
  const result = await createMediaArtifact({
    mediaArtifact: { id: 'test-id', name: 'Test Artifact', mediaArtifactType: 'non-existent-type' },
    userId: 123,
  })

  // Verify result
  expect(result).toEqual(err(new MediaArtifactTypeNotFoundError('non-existent-type')))

  // Verify no events were saved
  const events = eventStore.get('media-artifact-id-test-id')
  expect(events).toEqual([])
})
