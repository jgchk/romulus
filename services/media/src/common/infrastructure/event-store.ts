import type { MaybePromise } from '../../utils.js'

export type IEventStore<L extends EventSignature<L> = DefaultEventSignature> = {
  get<U extends keyof L>(id: U): MaybePromise<L[U][]>
  save<U extends keyof L>(id: U, events: L[U][]): MaybePromise<void>
  on<U extends keyof L>(id: U, callback: (events: L[U][]) => void): void
  off<U extends keyof L>(id: U, callback: (events: L[U][]) => void): void
}

export type EventSignature<L> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [E in keyof L]: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultEventSignature = Record<string, any>
