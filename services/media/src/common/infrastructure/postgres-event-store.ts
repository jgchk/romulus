import { EventEmitter } from 'node:events'

import { eq, max } from 'drizzle-orm'

import { type IDrizzleEventStoreConnection } from './drizzle/event-store/connection.js'
import { eventsTable } from './drizzle/event-store/schema.js'
import { type EventEnvelope, type IEventStore } from './event-store.js'

export class PostgresEventStore<L extends Record<string, unknown>> implements IEventStore<L> {
  private eventEmitter: EventEmitter

  constructor(private db: IDrizzleEventStoreConnection) {
    this.eventEmitter = new EventEmitter()
  }

  async get<T extends keyof L & string>(aggregateId: T): Promise<EventEnvelope<T, L[T]>[]> {
    const results = await this.db.query.eventsTable.findMany({
      where: (events, { eq }) => eq(events.aggregateId, aggregateId),
      orderBy: (events, { asc }) => asc(events.version),
    })

    return results as EventEnvelope<T, L[T]>[]
  }

  async getAll<T extends keyof L & string>(): Promise<EventEnvelope<T, L[T]>[]> {
    const results = await this.db.query.eventsTable.findMany({
      orderBy: (events, { asc }) => asc(events.sequence),
    })

    return results as EventEnvelope<T, L[T]>[]
  }

  async save<T extends keyof L & string>(aggregateId: T, events: L[T][]): Promise<void> {
    if (events.length === 0) return

    const envelopedEvents = await this.db.transaction(async (tx) => {
      const currentVersionResult = await tx
        .select({ version: max(eventsTable.version) })
        .from(eventsTable)
        .where(eq(eventsTable.aggregateId, aggregateId))
      const currentVersion = currentVersionResult[0]?.version ?? 0

      const currentSequenceResult = await tx
        .select({ sequence: max(eventsTable.sequence) })
        .from(eventsTable)
      const currentSequence = currentSequenceResult[0]?.sequence ?? 0

      const envelopedEvents = await tx
        .insert(eventsTable)
        .values(
          events.map((event, i) => ({
            aggregateId,
            version: currentVersion + 1 + i,
            sequence: currentSequence + 1 + i,
            timestamp: new Date(),
            eventData: event,
          })),
        )
        .returning()

      return envelopedEvents
    })

    this.eventEmitter.emit(aggregateId, envelopedEvents)

    // Emit to global subscribers
    this.eventEmitter.emit('*', envelopedEvents)
  }

  on<T extends keyof L & string>(
    aggregateId: T,
    callback: (events: EventEnvelope<T, L[T]>[]) => void,
  ): void {
    this.eventEmitter.on(aggregateId, callback)
  }

  off<T extends keyof L & string>(
    aggregateId: T,
    callback: (events: EventEnvelope<T, L[T]>[]) => void,
  ): void {
    this.eventEmitter.off(aggregateId, callback)
  }

  onAll<T extends keyof L & string>(callback: (events: EventEnvelope<T, L[T]>[]) => void): void {
    this.eventEmitter.on('*', callback)
  }

  offAll<T extends keyof L & string>(callback: (events: EventEnvelope<T, L[T]>[]) => void): void {
    this.eventEmitter.off('*', callback)
  }
}
