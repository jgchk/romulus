import { type MediaTypeDeletedEvent, mediaTypeDeletedEvent } from '../../../common/domain/events.js'

export function deleteMediaType(command: DeleteMediaTypeCommand): MediaTypeDeletedEvent {
  return mediaTypeDeletedEvent({ id: command.id, userId: command.userId })
}

export type DeleteMediaTypeCommand = {
  id: string
  userId: number
}
