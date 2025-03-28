import { err, ok, type Result } from 'neverthrow'

import type { MediaTypeEvent, MediaTypeUpdatedEvent } from '../../common/domain/events.js'
import type { MaybePromise } from '../../utils.js'
import type { MediaTypeNotFoundError, MediaTypeTreeCycleError } from '../domain/errors.js'
import { createProjectionFromEvents } from '../domain/projection.js'
import {
  createUpdateMediaTypeCommand,
  type UpdateMediaTypeCommand,
} from '../domain/update-media-type.js'

export type UpdateMediaTypeCommandHandler = (
  command: UpdateMediaTypeCommand,
) => Promise<Result<void, MediaTypeTreeCycleError | MediaTypeNotFoundError>>

export function createUpdateMediaTypeCommandHandler(
  getEvents: () => MaybePromise<MediaTypeEvent[]>,
  saveEvent: (event: MediaTypeUpdatedEvent) => MaybePromise<void>,
): UpdateMediaTypeCommandHandler {
  return async function (command) {
    const projection = createProjectionFromEvents(await getEvents())
    const updateMediaType = createUpdateMediaTypeCommand(projection)

    const result = updateMediaType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveEvent(result.value)

    return ok(undefined)
  }
}
