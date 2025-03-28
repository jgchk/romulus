import { type MediaTypeDeletedEvent } from '../../common/domain/events.js'
import type { MaybePromise } from '../../utils.js'
import { deleteMediaType, type DeleteMediaTypeCommand } from '../domain/delete-media-type.js'

export function createDeleteMediaTypeCommand(
  saveEvent: (event: MediaTypeDeletedEvent) => MaybePromise<void>,
) {
  return async function (command: DeleteMediaTypeCommand): Promise<void> {
    const event = deleteMediaType(command)

    await saveEvent(event)
  }
}
