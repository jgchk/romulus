import type { MaybePromise } from '$lib/utils/types'

import type { IEvent } from './event'

export type IEventStore<Data> = {
  append(event: Omit<IEvent<Data>, 'id' | 'sequence' | 'timestamp'>): MaybePromise<IEvent<Data>>
  getEvents(aggregateId: string): MaybePromise<IEvent<Data>[]>
  getAllEvents(): MaybePromise<IEvent<Data>[]>
}
