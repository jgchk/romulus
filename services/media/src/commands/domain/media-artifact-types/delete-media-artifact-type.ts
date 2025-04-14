import {
  type MediaArtifactTypeDeletedEvent,
  mediaArtifactTypeDeletedEvent,
} from '../../../common/domain/events.js'

export function deleteMediaArtifactType(
  command: DeleteMediaArtifactTypeCommand,
): MediaArtifactTypeDeletedEvent {
  return mediaArtifactTypeDeletedEvent({ id: command.id })
}

export type DeleteMediaArtifactTypeCommand = {
  id: string
}
