import { eq, max } from 'drizzle-orm'

import type { IDrizzleConnection } from '../db/connection'
import { events as eventsTable } from '../db/schema'
import type { EventStore, InsertEvent, SelectEvent } from './types'

export class PostgresEventStore implements EventStore {
  constructor(private db: IDrizzleConnection) {}

  async insert(streamName: string, insertEvent: InsertEvent): Promise<void> {
    const currentVersion = await this.getCurrentVersion(streamName)
    const currentSequence = await this.getCurrentSequence()

    await this.db.insert(eventsTable).values({
      id: insertEvent.id,
      streamName,
      eventType: insertEvent.type,
      data: insertEvent.data,
      version: currentVersion + 1,
      sequence: currentSequence + 1,
      timestamp: insertEvent.timestamp,
    })
  }

  async getEvents(streamName: string): Promise<SelectEvent[]> {
    const results = await this.db.query.events.findMany({
      where: (events, { eq }) => eq(events.streamName, streamName),
      orderBy: (events, { asc }) => asc(events.version),
    })

    return this.mapFromDbEvent(results)
  }

  async getEventsByType(type: string): Promise<SelectEvent[]> {
    const results = await this.db.query.events.findMany({
      where: (events, { eq }) => eq(events.eventType, type),
      orderBy: (events, { asc }) => asc(events.sequence),
    })

    return this.mapFromDbEvent(results)
  }

  async getAllEvents(): Promise<SelectEvent[]> {
    const results = await this.db.query.events.findMany({
      orderBy: (events, { asc }) => asc(events.sequence),
    })

    return this.mapFromDbEvent(results)
  }

  private async getCurrentVersion(streamName: string) {
    const currentVersionResult = await this.db
      .select({
        currentVersion: max(eventsTable.version),
      })
      .from(eventsTable)
      .where(eq(eventsTable.streamName, streamName))
    const currentVersion = currentVersionResult[0].currentVersion ?? 0
    return currentVersion
  }

  private async getCurrentSequence() {
    const currentSequenceResult = await this.db
      .select({
        currentSequence: max(eventsTable.sequence),
      })
      .from(eventsTable)
    const currentSequence = currentSequenceResult[0].currentSequence ?? 0
    return currentSequence
  }

  private mapFromDbEvent(
    results: {
      data: unknown
      id: string
      streamName: string
      eventType: string
      version: number
      sequence: number
      timestamp: Date
    }[],
  ): SelectEvent[] {
    return results.map((result) => ({
      id: result.id,
      streamName: result.streamName,
      type: result.eventType,
      data: result.data,
      version: result.version,
      sequence: result.sequence,
      timestamp: result.timestamp,
    }))
  }
}
