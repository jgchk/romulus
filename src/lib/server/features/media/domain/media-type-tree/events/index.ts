import type { MediaTypeAddedEvent } from './media-type-added'
import type { MediaTypeParentAddedEvent } from './media-type-parent-added'

export type Event = MediaTypeAddedEvent | MediaTypeParentAddedEvent
