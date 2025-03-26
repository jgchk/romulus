export function deleteMediaType(command: DeleteMediaTypeCommand) {
  return mediaTypeDeletedEvent({ id: command.id })
}

export type DeleteMediaTypeCommand = {
  id: string
}

export type MediaTypeDeletedEvent = {
  _tag: 'media-type-deleted'
  id: string
}

export function mediaTypeDeletedEvent(
  event: Omit<MediaTypeDeletedEvent, '_tag'>,
): MediaTypeDeletedEvent {
  return { ...event, _tag: 'media-type-deleted' }
}
