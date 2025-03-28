import { err, ok, type Result } from 'neverthrow'

import { type MediaTypeCreatedEvent } from '../../common/domain/events.js'
import type { MaybePromise } from '../../utils.js'
import { createMediaType, type CreateMediaTypeCommand } from '../domain/create-media-type.js'
import type { MediaTypeTreeCycleError } from '../domain/errors.js'

export type CreateMediaTypeCommandHandler = (
  command: CreateMediaTypeCommand,
) => Promise<Result<void, MediaTypeTreeCycleError>>

export function createCreateMediaTypeCommandHandler(
  saveEvent: (event: MediaTypeCreatedEvent) => MaybePromise<void>,
): CreateMediaTypeCommandHandler {
  return async function (command) {
    const result = createMediaType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveEvent(result.value)

    return ok(undefined)
  }
}
