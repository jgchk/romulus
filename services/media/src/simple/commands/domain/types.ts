import type { MediaTypeCreatedEvent } from './create-media-type.js'
import type { MediaTypeDeletedEvent } from './delete-media-type.js'
import type { MediaTypeUpdatedEvent } from './update-media-type.js'

export type MediaType = {
  id: string
  name: string
  parents: string[]
}

export type MediaTypeEvent = MediaTypeCreatedEvent | MediaTypeDeletedEvent | MediaTypeUpdatedEvent
