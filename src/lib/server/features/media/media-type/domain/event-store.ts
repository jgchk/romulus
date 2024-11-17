import type { MaybePromise } from '$lib/utils/types'

import type { MediaTypeEvent } from './events'

export type IMediaTypeEventStore = {
  get(): MaybePromise<MediaTypeEvent[]>
  save(event: MediaTypeEvent): MaybePromise<void>
}
