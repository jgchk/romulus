import type { Event } from './events'

export type IEventStore = {
  get(): Event[] | Promise<Event[]>
  save(event: Event): void | Promise<void>
}
