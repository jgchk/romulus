import { err, ok, type Result } from 'neverthrow'

import type { MediaArtifactTypeCreatedEvent } from '../../../common/domain/events.js'
import type { MaybePromise } from '../../../utils.js'
import * as domain from '../../domain/media-artifact-types/create-media-artifact-type.js'
import type { MediaArtifactTypeNotFoundError } from '../../domain/media-artifact-types/errors.js'
import type { MediaTypeNotFoundError } from '../../domain/media-types/errors.js'
import { type MediaTypesProjection } from '../../domain/media-types/media-types-projection.js'

export type CreateMediaArtifactTypeCommandHandler = (
  command: domain.CreateMediaArtifactTypeCommand,
) => Promise<Result<void, MediaTypeNotFoundError | MediaArtifactTypeNotFoundError>>

export function createCreateMediaArtifactTypeCommandHandler({
  getMediaTypes,
  saveMediaArtifactTypeEvent,
}: {
  getMediaTypes: () => MaybePromise<MediaTypesProjection>
  saveMediaArtifactTypeEvent: (event: MediaArtifactTypeCreatedEvent) => MaybePromise<void>
}): CreateMediaArtifactTypeCommandHandler {
  return async function (command) {
    const createMediaArtifactType = domain.createCreateMediaArtifactTypeCommandHandler(
      await getMediaTypes(),
    )

    const result = createMediaArtifactType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveMediaArtifactTypeEvent(result.value)

    return ok(undefined)
  }
}
