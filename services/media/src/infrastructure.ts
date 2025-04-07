import type { MediaTypeEvent } from './common/domain/events.js'
import * as eventStoreDb from './common/infrastructure/drizzle/event-store/postgres.js'
import { migratePostgres } from './common/infrastructure/drizzle/migrate.js'
import type { IEventStore } from './common/infrastructure/event-store.js'
import { PostgresEventStore } from './common/infrastructure/postgres-event-store.js'
import { applyEvent } from './queries/application/projection.js'
import type { IDrizzleConnection as QueryProjectionDrizzleConnection } from './queries/infrastructure/drizzle-database.js'
import {
  getDbConnection,
  getPostgresConnection,
} from './queries/infrastructure/drizzle-postgres-connection.js'

export type MediaInfrastructure = {
  db: QueryProjectionDrizzleConnection
  eventStore: IEventStore<MediaTypeEvent>
  destroy: () => Promise<void>
}

export async function createMediaInfrastructure(databaseUrl: string): Promise<MediaInfrastructure> {
  const pg = getPostgresConnection(databaseUrl)
  const db = getDbConnection(pg)
  await migratePostgres(db)

  const eventStorePostgres = eventStoreDb.getPostgresConnection(databaseUrl)
  const eventStoreDrizzle = eventStoreDb.getDbConnection(eventStorePostgres)
  const eventStore = new PostgresEventStore<MediaTypeEvent>(eventStoreDrizzle)

  function handleEvents(events: MediaTypeEvent[]) {
    async function handle() {
      for (const event of events) {
        await applyEvent(db, event)
      }
    }

    void handle()
  }

  eventStore.on('media-types', handleEvents)

  return {
    db,
    eventStore,
    destroy: async () => {
      await pg.end()
      await eventStorePostgres.end()
      eventStore.off('media-types', handleEvents)
    },
  }
}
