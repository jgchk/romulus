import { eq, max } from 'drizzle-orm'

import type { IDrizzleEventStoreConnection } from './drizzle/event-store/connection.js'
import { eventsTable } from './drizzle/event-store/schema.js'
import type { IEventStore } from './event-store.js'

export class PostgresEventStore<Event extends object> implements IEventStore<Event> {
  constructor(private db: IDrizzleEventStoreConnection) {}

  async get(id: string): Promise<Event[]> {
    const results = await this.db.query.eventsTable.findMany({
      where: (events, { eq }) => eq(events.aggregateId, id),
      orderBy: (events, { asc }) => asc(events.version),
    })

    return results.map((result) => result.eventData as Event)
  }

  async save(id: string, events: Event[]): Promise<void> {
    if (events.length === 0) return

    await this.db.transaction(async (tx) => {
      const currentVersionResult = await tx
        .select({ version: max(eventsTable.version) })
        .from(eventsTable)
        .where(eq(eventsTable.aggregateId, id))
      const currentVersion = currentVersionResult[0]?.version ?? 0

      const currentSequenceResult = await tx
        .select({ sequence: max(eventsTable.sequence) })
        .from(eventsTable)
      const currentSequence = currentSequenceResult[0]?.sequence ?? 0

      await tx.insert(eventsTable).values(
        events.map((event, i) => ({
          aggregateId: id,
          version: currentVersion + 1 + i,
          sequence: currentSequence + 1 + i,
          timestamp: new Date(),
          eventData: event,
        })),
      )
    })
  }
}
