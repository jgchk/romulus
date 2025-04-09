import { err, ok, type Result } from 'neverthrow'

import type { MediaArtifactRelationshipTypeCreatedEvent } from '../../../common/domain/events.js'
import type { MaybePromise } from '../../../utils.js'
import * as domain from '../../domain/media-artifact-types/create-media-artifact-relationship-type.js'
import type { MediaArtifactTypeNotFoundError } from '../../domain/media-artifact-types/errors.js'
import type { MediaArtifactTypesProjection } from '../../domain/media-artifact-types/media-artifact-types-projection.js'

export type CreateMediaArtifactRelationshipTypeCommandHandler = (
  command: domain.CreateMediaArtifactRelationshipTypeCommand,
) => Promise<Result<void, MediaArtifactTypeNotFoundError>>

export function createCreateMediaArtifactRelationshipTypeCommandHandler({
  getMediaArtifactTypes,
  saveMediaArtifactTypeEvent,
}: {
  getMediaArtifactTypes: () => MaybePromise<MediaArtifactTypesProjection>
  saveMediaArtifactTypeEvent: (
    event: MediaArtifactRelationshipTypeCreatedEvent,
  ) => MaybePromise<void>
}): CreateMediaArtifactRelationshipTypeCommandHandler {
  return async function (command) {
    const createMediaArtifactRelationshipType =
      domain.createCreateMediaArtifactRelationshipTypeCommandHandler(await getMediaArtifactTypes())

    const result = createMediaArtifactRelationshipType(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveMediaArtifactTypeEvent(result.value)

    return ok(undefined)
  }
}
