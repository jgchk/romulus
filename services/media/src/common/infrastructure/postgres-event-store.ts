import { EventEmitter } from 'node:events'

import { eq, max } from 'drizzle-orm'

import type { IDrizzleEventStoreConnection } from './drizzle/event-store/connection.js'
import { eventsTable } from './drizzle/event-store/schema.js'
import type {
  DefaultEventSignature,
  EventEnvelope,
  EventSignature,
  IEventStore,
} from './event-store.js'

export class PostgresEventStore<L extends EventSignature<L> = DefaultEventSignature>
  implements IEventStore<EventSignature<L>>
{
  private eventEmitter: EventEmitter

  constructor(private db: IDrizzleEventStoreConnection) {
    this.eventEmitter = new EventEmitter()
  }

  async get<U extends keyof L>(id: U): Promise<EventEnvelope<U, L[U]>[]> {
    const results = await this.db.query.eventsTable.findMany({
      where: (events, { eq }) => eq(events.aggregateId, id.toString()),
      orderBy: (events, { asc }) => asc(events.version),
    })

    return results as EventEnvelope<U, L[U]>[]
  }

  async getAll<T extends keyof L = keyof L>(): Promise<EventEnvelope<T, L[T]>[]> {
    const results = await this.db.query.eventsTable.findMany({
      orderBy: (events, { asc }) => asc(events.sequence),
    })

    return results as EventEnvelope<T, L[T]>[]
  }

  async save<U extends keyof L>(id: U, events: L[U][]): Promise<void> {
    if (events.length === 0) return

    const envelopedEvents = await this.db.transaction(async (tx) => {
      const currentVersionResult = await tx
        .select({ version: max(eventsTable.version) })
        .from(eventsTable)
        .where(eq(eventsTable.aggregateId, id.toString()))
      const currentVersion = currentVersionResult[0]?.version ?? 0

      const currentSequenceResult = await tx
        .select({ sequence: max(eventsTable.sequence) })
        .from(eventsTable)
      const currentSequence = currentSequenceResult[0]?.sequence ?? 0

      const envelopedEvents = await tx
        .insert(eventsTable)
        .values(
          events.map((event, i) => ({
            aggregateId: id.toString(),
            version: currentVersion + 1 + i,
            sequence: currentSequence + 1 + i,
            timestamp: new Date(),
            eventData: event,
          })),
        )
        .returning()

      return envelopedEvents
    })

    this.eventEmitter.emit(id.toString(), envelopedEvents)

    // Emit to global subscribers
    this.eventEmitter.emit('*', envelopedEvents)
  }

  on<U extends keyof L>(id: U, callback: (events: EventEnvelope<U, L[U]>[]) => void): void {
    this.eventEmitter.on(id.toString(), callback)
  }

  off<U extends keyof L>(id: U, callback: (events: EventEnvelope<U, L[U]>[]) => void): void {
    this.eventEmitter.off(id.toString(), callback)
  }

  onAll<T extends keyof L = keyof L>(callback: (events: EventEnvelope<T, L[T]>[]) => void): void {
    this.eventEmitter.on('*', callback)
  }

  offAll<T extends keyof L = keyof L>(callback: (events: EventEnvelope<T, L[T]>[]) => void): void {
    this.eventEmitter.off('*', callback)
  }
}
