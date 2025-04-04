import type { MaybePromise } from '../../utils.js'

export type IEventStore<Event> = {
  get(id: string): MaybePromise<Event[]>
  save(id: string, events: Event[]): MaybePromise<void>
}
