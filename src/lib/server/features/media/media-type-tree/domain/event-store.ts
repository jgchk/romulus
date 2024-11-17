import type { MaybePromise } from '$lib/utils/types'

import type { MediaTypeTreeEvent } from './events'

export type IMediaTypeTreeEventStore = {
  get(): MaybePromise<MediaTypeTreeEvent[]>
  save(event: MediaTypeTreeEvent): MaybePromise<void>
}
