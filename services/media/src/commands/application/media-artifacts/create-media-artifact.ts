import { err, ok, type Result } from 'neverthrow'

import type { MediaArtifactCreatedEvent } from '../../../common/domain/events.js'
import type { MaybePromise } from '../../../utils.js'
import type { MediaArtifactTypeNotFoundError } from '../../domain/media-artifact-types/errors.js'
import type { MediaArtifactTypesProjection } from '../../domain/media-artifact-types/media-artifact-types-projection.js'
import * as domain from '../../domain/media-artifacts/create-media-artifact.js'

export type CreateMediaArtifactCommandHandler = (
  command: domain.CreateMediaArtifactCommand,
) => Promise<Result<void, MediaArtifactTypeNotFoundError>>

export function createCreateMediaArtifactCommandHandler(
  getMediaArtifactTypes: () => MaybePromise<MediaArtifactTypesProjection>,
  saveEvent: (id: string, event: MediaArtifactCreatedEvent) => MaybePromise<void>,
): CreateMediaArtifactCommandHandler {
  return async function (command) {
    const mediaArtifactTypes = await getMediaArtifactTypes()
    const createMediaArtifact = domain.createCreateMediaArtifactCommandHandler(mediaArtifactTypes)

    const result = createMediaArtifact(command)

    if (result.isErr()) {
      return err(result.error)
    }

    await saveEvent(result.value.mediaArtifact.id, result.value)

    return ok(undefined)
  }
}
