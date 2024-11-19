import type { EventStore, InsertEvent, SelectEvent } from './types'

export class MemoryEventStore implements EventStore {
  private events: SelectEvent[] = []
  private versionsByStream = new Map<string, number>()
  private currentSequence = 0

  insert(streamName: string, insertEvent: InsertEvent): void {
    const currentVersion = this.versionsByStream.get(streamName) ?? 0
    const nextVersion = currentVersion + 1
    const nextSequence = this.currentSequence + 1

    const event: SelectEvent = {
      id: insertEvent.id,
      streamName,
      type: insertEvent.type,
      data: insertEvent.data,
      version: nextVersion,
      sequence: nextSequence,
      timestamp: insertEvent.timestamp,
    }

    this.events.push(event)
    this.versionsByStream.set(streamName, nextVersion)
    this.currentSequence = nextSequence
  }

  getEvents(streamName: string): SelectEvent[] {
    return this.events
      .filter((event) => event.streamName === streamName)
      .sort((a, b) => a.version - b.version)
  }

  getEventsByType(type: string): SelectEvent[] {
    return this.events
      .filter((event) => event.type === type)
      .sort((a, b) => a.sequence - b.sequence)
  }

  getAllEvents(): SelectEvent[] {
    return [...this.events].sort((a, b) => a.sequence - b.sequence)
  }
}
