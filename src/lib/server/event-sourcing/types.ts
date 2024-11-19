import type { MaybePromise } from '$lib/utils/types'

export type InsertEvent<Type extends string = string, Data = unknown> = {
  id: string
  type: Type
  data: Data
  timestamp: Date
}

export type SelectEvent<Data = unknown> = {
  id: string
  streamName: string
  type: string
  data: Data
  version: number
  sequence: number
  timestamp: Date
}

export type EventStore = {
  insert(streamName: string, event: InsertEvent): MaybePromise<void>
  getEvents(streamName: string): MaybePromise<SelectEvent[]>
  getEventsByType(type: string): MaybePromise<SelectEvent[]>
  getAllEvents(): MaybePromise<SelectEvent[]>
}
