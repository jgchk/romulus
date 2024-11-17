import type { IEvent } from './event'

export type IEventStore = {
  get(): IEvent[] | Promise<IEvent[]>
  save(event: IEvent): void | Promise<void>
}
