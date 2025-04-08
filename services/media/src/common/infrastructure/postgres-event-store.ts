import { eq, max } from 'drizzle-orm'
import { TypedEmitter } from 'tiny-typed-emitter'

import type { IDrizzleEventStoreConnection } from './drizzle/event-store/connection.js'
import { eventsTable } from './drizzle/event-store/schema.js'
import type { DefaultEventSignature, EventSignature, IEventStore } from './event-store.js'

export class PostgresEventStore<L extends EventSignature<L> = DefaultEventSignature>
  implements IEventStore<EventSignature<L>>
{
  private eventEmitter: TypedEmitter<{ [E in keyof L]: (events: L[E][]) => void }>

  constructor(private db: IDrizzleEventStoreConnection) {
    this.eventEmitter = new TypedEmitter()
  }

  async get<U extends keyof L>(id: U): Promise<L[U][]> {
    const results = await this.db.query.eventsTable.findMany({
      where: (events, { eq }) => eq(events.aggregateId, id.toString()),
      orderBy: (events, { asc }) => asc(events.version),
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return results.map((result) => result.eventData as L[U])
  }

  async save<U extends keyof L>(id: U, events: L[U][]): Promise<void> {
    if (events.length === 0) return

    await this.db.transaction(async (tx) => {
      const currentVersionResult = await tx
        .select({ version: max(eventsTable.version) })
        .from(eventsTable)
        .where(eq(eventsTable.aggregateId, id.toString()))
      const currentVersion = currentVersionResult[0]?.version ?? 0

      const currentSequenceResult = await tx
        .select({ sequence: max(eventsTable.sequence) })
        .from(eventsTable)
      const currentSequence = currentSequenceResult[0]?.sequence ?? 0

      await tx.insert(eventsTable).values(
        events.map((event, i) => ({
          aggregateId: id.toString(),
          version: currentVersion + 1 + i,
          sequence: currentSequence + 1 + i,
          timestamp: new Date(),
          eventData: event,
        })),
      )
    })

    // @ts-expect-error - TS is not smart enough to infer the type of `events`
    this.eventEmitter.emit(id, events)
  }

  on<U extends keyof L>(id: U, callback: (events: L[U][]) => void): void {
    this.eventEmitter.on(id, callback)
  }

  off<U extends keyof L>(id: U, callback: (events: L[U][]) => void): void {
    this.eventEmitter.off(id, callback)
  }
}
