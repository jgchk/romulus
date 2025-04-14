import type { MediaArtifactTypeDeletedEvent } from '../../../common/domain/events.js'
import type { MaybePromise } from '../../../utils.js'
import {
  deleteMediaArtifactType,
  type DeleteMediaArtifactTypeCommand,
} from '../../domain/media-artifact-types/delete-media-artifact-type.js'

export type DeleteMediaArtifactTypeCommandHandler = (
  command: DeleteMediaArtifactTypeCommand,
) => Promise<void>

export function createDeleteMediaArtifactTypeCommandHandler({
  saveMediaArtifactTypeEvent,
}: {
  saveMediaArtifactTypeEvent: (event: MediaArtifactTypeDeletedEvent) => MaybePromise<void>
}): DeleteMediaArtifactTypeCommandHandler {
  return async function (command) {
    const event = deleteMediaArtifactType(command)

    await saveMediaArtifactTypeEvent(event)
  }
}
