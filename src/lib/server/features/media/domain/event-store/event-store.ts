import type { Event } from '../media-type-tree/events'

export type IEventStore = {
  get(): Event[] | Promise<Event[]>
  save(event: Event): void | Promise<void>
}
