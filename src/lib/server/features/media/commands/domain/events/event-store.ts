import type { IEvent } from './event'

export type IEventStore = {
  save(event: IEvent): Promise<void>
}
