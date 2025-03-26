import { err, ok, type Result } from 'neverthrow'

import type { MaybePromise } from '../../../utils.js'
import { type MediaTypeCreatedEvent } from '../../common/domain/events.js'
import { createMediaType, type CreateMediaTypeCommand } from '../domain/create-media-type.js'
import type { MediaTypeTreeCycleError } from '../domain/errors.js'

export function createCreateMediaTypeCommand(
  saveEvent: (event: MediaTypeCreatedEvent) => MaybePromise<void>,
) {
  return async function (
    command: CreateMediaTypeCommand,
  ): Promise<Result<void, MediaTypeTreeCycleError>> {
    const result = createMediaType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveEvent(result.value)

    return ok(undefined)
  }
}
