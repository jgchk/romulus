import { err, ok, type Result } from 'neverthrow'

import { type MediaTypeCreatedEvent } from '../../../common/domain/events.js'
import type { MaybePromise } from '../../../utils.js'
import * as domain from '../../domain/media-types/create-media-type.js'
import type {
  MediaTypeNotFoundError,
  MediaTypeTreeCycleError,
} from '../../domain/media-types/errors.js'
import type { MediaTypesProjection } from '../../domain/media-types/media-types-projection.js'

export type CreateMediaTypeCommandHandler = (
  command: domain.CreateMediaTypeCommand,
) => Promise<Result<void, MediaTypeTreeCycleError | MediaTypeNotFoundError>>

export function createCreateMediaTypeCommandHandler(
  getMediaTypes: () => MaybePromise<MediaTypesProjection>,
  saveEvent: (event: MediaTypeCreatedEvent) => MaybePromise<void>,
): CreateMediaTypeCommandHandler {
  return async function (command) {
    const mediaTypes = await getMediaTypes()
    const createMediaType = domain.createCreateMediaTypeCommandHandler(mediaTypes)

    const result = createMediaType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveEvent(result.value)

    return ok(undefined)
  }
}
