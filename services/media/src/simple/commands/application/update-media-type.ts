import { err, ok, type Result } from 'neverthrow'

import type { MaybePromise } from '../../../utils.js'
import type { MediaTypeNotFoundError, MediaTypeTreeCycleError } from '../domain/errors.js'
import { createProjectionFromEvents } from '../domain/projection.js'
import type { MediaTypeEvent } from '../../common/domain/events.js'
import * as domain from '../domain/update-media-type.js'

export function createUpdateMediaTypeCommand(
  getEvents: () => MaybePromise<MediaTypeEvent[]>,
  saveEvent: (event: domain.MediaTypeUpdatedEvent) => MaybePromise<void>,
) {
  return async function (
    command: domain.UpdateMediaTypeCommand,
  ): Promise<Result<void, MediaTypeTreeCycleError | MediaTypeNotFoundError>> {
    const projection = createProjectionFromEvents(await getEvents())
    const updateMediaType = domain.createUpdateMediaTypeCommand(projection)

    const result = updateMediaType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveEvent(result.value)

    return ok(undefined)
  }
}
