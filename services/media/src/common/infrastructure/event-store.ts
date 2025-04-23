import type { MaybePromise } from '../../utils.js'

export type IEventStore<L extends EventSignature<L> = DefaultEventSignature> = {
  get<U extends keyof L>(aggregateId: U): MaybePromise<EventEnvelope<U, L[U]>[]>
  getAll<T extends keyof L = keyof L>(): MaybePromise<EventEnvelope<T, L[T]>[]>
  save<U extends keyof L>(aggregateId: U, events: L[U][]): MaybePromise<void>
  on<U extends keyof L>(aggregateId: U, callback: (events: EventEnvelope<U, L[U]>[]) => void): void
  off<U extends keyof L>(aggregateId: U, callback: (events: EventEnvelope<U, L[U]>[]) => void): void
}

export type EventSignature<L> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [E in keyof L]: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultEventSignature = Record<string, any>

export type EventEnvelope<A, E> = {
  aggregateId: A
  version: number
  sequence: number
  timestamp: Date
  eventData: E
}
