import { type Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import { type MediaArtifactTypeUpdatedEvent } from '../../../common/domain/events.js'
import { type MaybePromise } from '../../../utils.js'
import { type MediaArtifactTypeNotFoundError } from '../../domain/media-artifact-types/errors.js'
import { type MediaArtifactTypesProjection } from '../../domain/media-artifact-types/media-artifact-types-projection.js'
import * as domain from '../../domain/media-artifact-types/update-media-artifact-type.js'
import { type MediaTypeNotFoundError } from '../../domain/media-types/errors.js'
import { type MediaTypesProjection } from '../../domain/media-types/media-types-projection.js'

export type UpdateMediaArtifactTypeCommandHandler = (
  command: domain.UpdateMediaArtifactTypeCommand,
) => Promise<Result<void, MediaArtifactTypeNotFoundError | MediaTypeNotFoundError>>

export function createUpdateMediaArtifactTypeCommandHandler({
  getMediaTypes,
  getMediaArtifactTypes,
  saveMediaArtifactTypeEvent,
}: {
  getMediaTypes: () => MaybePromise<MediaTypesProjection>
  getMediaArtifactTypes: () => MaybePromise<MediaArtifactTypesProjection>
  saveMediaArtifactTypeEvent: (event: MediaArtifactTypeUpdatedEvent) => MaybePromise<void>
}) {
  return async function updateMediaArtifactType(command: domain.UpdateMediaArtifactTypeCommand) {
    const updateMediaArtifactType = domain.createUpdateMediaArtifactTypeCommandHandler({
      mediaTypes: await getMediaTypes(),
      mediaArtifactTypes: await getMediaArtifactTypes(),
    })

    const result = updateMediaArtifactType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveMediaArtifactTypeEvent(result.value)

    return ok(undefined)
  }
}
