import { err, ok, type Result } from 'neverthrow'

import type { MediaTypeUpdatedEvent } from '../../../common/domain/events.js'
import type { MaybePromise } from '../../../utils.js'
import type {
  MediaTypeNotFoundError,
  MediaTypeTreeCycleError,
} from '../../domain/media-types/errors.js'
import type { MediaTypesProjection } from '../../domain/media-types/media-types-projection.js'
import {
  createUpdateMediaTypeCommand,
  type UpdateMediaTypeCommand,
} from '../../domain/media-types/update-media-type.js'

export type UpdateMediaTypeCommandHandler = (
  command: UpdateMediaTypeCommand,
) => Promise<Result<void, MediaTypeTreeCycleError | MediaTypeNotFoundError>>

export function createUpdateMediaTypeCommandHandler(
  getMediaTypes: () => MaybePromise<MediaTypesProjection>,
  saveEvent: (event: MediaTypeUpdatedEvent) => MaybePromise<void>,
): UpdateMediaTypeCommandHandler {
  return async function (command) {
    const mediaTypes = await getMediaTypes()
    const updateMediaType = createUpdateMediaTypeCommand(mediaTypes)

    const result = updateMediaType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveEvent(result.value)

    return ok(undefined)
  }
}
