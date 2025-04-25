import { type MaybePromise } from '../../utils.js'

export type IEventStore<L extends Record<string, unknown>> = {
  get<T extends keyof L & string>(aggregateId: T): MaybePromise<EventEnvelope<T, L[T]>[]>
  getAll<T extends keyof L & string>(): MaybePromise<EventEnvelope<T, L[T]>[]>
  save<T extends keyof L & string>(aggregateId: T, events: L[T][]): MaybePromise<void>
  on<T extends keyof L & string>(
    aggregateId: T,
    callback: (events: EventEnvelope<T, L[T]>[]) => void,
  ): void
  off<T extends keyof L & string>(
    aggregateId: T,
    callback: (events: EventEnvelope<T, L[T]>[]) => void,
  ): void
  onAll<T extends keyof L & string>(callback: (events: EventEnvelope<T, L[T]>[]) => void): void
  offAll<T extends keyof L & string>(callback: (events: EventEnvelope<T, L[T]>[]) => void): void
}

export type EventEnvelope<A, E> = {
  aggregateId: A
  version: number
  sequence: number
  timestamp: Date
  eventData: E
}
