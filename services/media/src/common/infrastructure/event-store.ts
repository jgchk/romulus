import type { MaybePromise } from '../../utils.js'

export type IEventStore<Event> = {
  get(id: string): MaybePromise<Event[]>
  save(id: string, events: Event[]): MaybePromise<void>
  on(id: string, callback: (events: Event[]) => void): void
  off(id: string, callback: (events: Event[]) => void): void
}
