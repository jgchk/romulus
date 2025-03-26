import type { MediaTypeCreatedEvent } from '../../commands/domain/create-media-type.js'
import type { MediaTypeDeletedEvent } from '../../commands/domain/delete-media-type.js'
import type { MediaTypeUpdatedEvent } from '../../commands/domain/update-media-type.js'

export type MediaTypeEvent = MediaTypeCreatedEvent | MediaTypeDeletedEvent | MediaTypeUpdatedEvent
