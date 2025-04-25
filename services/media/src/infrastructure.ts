import { type MediaArtifactTypesProjection } from './commands/domain/media-artifact-types/media-artifact-types-projection.js'
import { type MediaTypesProjection } from './commands/domain/media-types/media-types-projection.js'
import {
  createGetMediaArtifactTypes,
  createSaveMediaArtifactTypeEvent,
} from './commands/infrastructure/media-artifact-types.js'
import { createSaveMediaArtifactEvent } from './commands/infrastructure/media-artifacts.js'
import {
  createGetMediaTypes,
  createSaveMediaTypeEvent,
} from './commands/infrastructure/media-types.js'
import {
  type MediaArtifactEvent,
  type MediaArtifactTypeEvent,
  type MediaTypeEvent,
} from './common/domain/events.js'
import * as eventStoreDb from './common/infrastructure/drizzle/event-store/postgres.js'
import { migratePostgres } from './common/infrastructure/drizzle/migrate.js'
import { type EventEnvelope } from './common/infrastructure/event-store.js'
import { PostgresEventStore } from './common/infrastructure/postgres-event-store.js'
import { applyEvent } from './queries/application/projection.js'
import { type IDrizzleConnection as QueryProjectionDrizzleConnection } from './queries/infrastructure/drizzle-database.js'
import {
  getDbConnection,
  getPostgresConnection,
} from './queries/infrastructure/drizzle-postgres-connection.js'

export type MediaInfrastructure = {
  db: QueryProjectionDrizzleConnection
  eventStore: {
    getMediaTypes: () => Promise<MediaTypesProjection>
    getMediaArtifactTypes: () => Promise<MediaArtifactTypesProjection>
    saveMediaTypeEvent: (event: MediaTypeEvent) => Promise<void>
    saveMediaArtifactTypeEvent: (event: MediaArtifactTypeEvent) => Promise<void>
    saveMediaArtifactEvent: (id: string, event: MediaArtifactEvent) => Promise<void>
  }
  destroy: () => Promise<void>
}

export async function createMediaInfrastructure(databaseUrl: string): Promise<MediaInfrastructure> {
  const pg = getPostgresConnection(databaseUrl)
  const db = getDbConnection(pg)
  await migratePostgres(db)

  const eventStorePostgres = eventStoreDb.getPostgresConnection(databaseUrl)
  const eventStoreDrizzle = eventStoreDb.getDbConnection(eventStorePostgres)
  const eventStore = new PostgresEventStore<{
    'media-types': MediaTypeEvent
    'media-artifact-types': MediaArtifactTypeEvent
    [key: `media-artifact-id-${string}`]: MediaArtifactEvent
  }>(eventStoreDrizzle)

  function handleEvents(
    events: (
      | EventEnvelope<'media-types', MediaTypeEvent>
      | EventEnvelope<'media-artifact-types', MediaArtifactTypeEvent>
      | EventEnvelope<`media-artifact-id-${string}`, MediaArtifactEvent>
    )[],
  ) {
    async function handle() {
      for (const event of events) {
        await applyEvent(db, event.eventData)
      }
    }

    void handle()
  }

  eventStore.onAll(handleEvents)

  return {
    db,
    eventStore: {
      getMediaTypes: createGetMediaTypes(eventStore),
      getMediaArtifactTypes: createGetMediaArtifactTypes(eventStore),
      saveMediaTypeEvent: createSaveMediaTypeEvent(eventStore),
      saveMediaArtifactTypeEvent: createSaveMediaArtifactTypeEvent(eventStore),
      saveMediaArtifactEvent: createSaveMediaArtifactEvent(eventStore),
    },
    destroy: async () => {
      await pg.end()
      await eventStorePostgres.end()
      eventStore.offAll(handleEvents)
    },
  }
}
