import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import type { MediaArtifactRelationshipTypeUpdatedEvent } from '../../../common/domain/events.js'
import type { MaybePromise } from '../../../utils.js'
import type { MediaArtifactRelationshipTypeNotFoundError } from '../../domain/media-artifact-relationship-types/errors.js'
import * as domain from '../../domain/media-artifact-relationship-types/update-media-artifact-relationship-type.js'
import type { MediaArtifactTypeNotFoundError } from '../../domain/media-artifact-types/errors.js'
import type { MediaArtifactTypesProjection } from '../../domain/media-artifact-types/media-artifact-types-projection.js'

export type UpdateMediaArtifactRelationshipTypeCommandHandler = (
  command: domain.UpdateMediaArtifactRelationshipTypeCommand,
) => Promise<
  Result<void, MediaArtifactRelationshipTypeNotFoundError | MediaArtifactTypeNotFoundError>
>

export function createUpdateMediaArtifactRelationshipTypeCommandHandler({
  getMediaArtifactTypes,
  saveMediaArtifactTypeEvent,
}: {
  getMediaArtifactTypes: () => MaybePromise<MediaArtifactTypesProjection>
  saveMediaArtifactTypeEvent: (
    event: MediaArtifactRelationshipTypeUpdatedEvent,
  ) => MaybePromise<void>
}): UpdateMediaArtifactRelationshipTypeCommandHandler {
  return async function updateMediaArtifactRelationshipType(command) {
    const updateMediaArtifactRelationshipType =
      domain.createUpdateMediaArtifactRelationshipTypeCommandHandler(await getMediaArtifactTypes())

    const result = updateMediaArtifactRelationshipType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveMediaArtifactTypeEvent(result.value)

    return ok(undefined)
  }
}
