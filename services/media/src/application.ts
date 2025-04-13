import {
  createCreateMediaArtifactRelationshipTypeCommandHandler,
  type CreateMediaArtifactRelationshipTypeCommandHandler,
} from './commands/application/media-artifact-types/create-media-artifact-relationship-type.js'
import {
  createCreateMediaArtifactTypeCommandHandler,
  type CreateMediaArtifactTypeCommandHandler,
} from './commands/application/media-artifact-types/create-media-artifact-type.js'
import {
  createUpdateMediaArtifactTypeCommandHandler,
  type UpdateMediaArtifactTypeCommandHandler,
} from './commands/application/media-artifact-types/update-media-artifact-type.js'
import {
  createCreateMediaTypeCommandHandler,
  type CreateMediaTypeCommandHandler,
} from './commands/application/media-types/create-media-type.js'
import {
  createDeleteMediaTypeCommandHandler,
  type DeleteMediaTypeCommandHandler,
} from './commands/application/media-types/delete-media-type.js'
import {
  createUpdateMediaTypeCommandHandler,
  type UpdateMediaTypeCommandHandler,
} from './commands/application/media-types/update-media-type.js'
import type { MediaArtifactTypesProjection } from './commands/domain/media-artifact-types/media-artifact-types-projection.js'
import type { MediaTypesProjection } from './commands/domain/media-types/media-types-projection.js'
import { MediaPermission } from './commands/domain/permissions.js'
import type { MediaArtifactTypeEvent, MediaTypeEvent } from './common/domain/events.js'
import {
  createGetAllMediaArtifactTypesQueryHandler,
  type GetAllMediaArtifactTypesQueryHandler,
} from './queries/application/get-all-media-artifact-types.js'
import {
  createGetAllMediaTypesQueryHandler,
  type GetAllMediaTypesQueryHandler,
} from './queries/application/get-all-media-types.js'
import {
  createGetMediaArtifactRelationshipTypeQueryHandler,
  type GetMediaArtifactRelationshipTypeQueryHandler,
} from './queries/application/get-media-artifact-relationship-type.js'
import {
  createGetMediaArtifactTypeQueryHandler,
  type GetMediaArtifactTypeQueryHandler,
} from './queries/application/get-media-artifact-type.js'
import {
  createGetMediaTypeQueryHandler,
  type GetMediaTypeQueryHandler,
} from './queries/application/get-media-type.js'
import type { IDrizzleConnection } from './queries/infrastructure/drizzle-database.js'
import type { MaybePromise } from './utils.js'

export type MediaApplication = {
  createMediaType: CreateMediaTypeCommandHandler
  deleteMediaType: DeleteMediaTypeCommandHandler
  updateMediaType: UpdateMediaTypeCommandHandler
  createMediaArtifactType: CreateMediaArtifactTypeCommandHandler
  updateMediaArtifactType: UpdateMediaArtifactTypeCommandHandler
  createMediaArtifactRelationshipType: CreateMediaArtifactRelationshipTypeCommandHandler
  getAllMediaTypes: GetAllMediaTypesQueryHandler
  getMediaType: GetMediaTypeQueryHandler
  getAllMediaArtifactTypes: GetAllMediaArtifactTypesQueryHandler
  getMediaArtifactType: GetMediaArtifactTypeQueryHandler
  getMediaArtifactRelationshipType: GetMediaArtifactRelationshipTypeQueryHandler
}

export function createMediaApplication({
  getMediaTypes,
  getMediaArtifactTypes,
  saveMediaTypeEvent,
  saveMediaArtifactTypeEvent,
  db,
}: {
  getMediaTypes: () => MaybePromise<MediaTypesProjection>
  getMediaArtifactTypes: () => MaybePromise<MediaArtifactTypesProjection>
  saveMediaTypeEvent: (event: MediaTypeEvent) => MaybePromise<void>
  saveMediaArtifactTypeEvent: (event: MediaArtifactTypeEvent) => MaybePromise<void>
  db: IDrizzleConnection
}): MediaApplication {
  return {
    createMediaType: createCreateMediaTypeCommandHandler(getMediaTypes, saveMediaTypeEvent),
    deleteMediaType: createDeleteMediaTypeCommandHandler(saveMediaTypeEvent),
    updateMediaType: createUpdateMediaTypeCommandHandler(getMediaTypes, saveMediaTypeEvent),
    createMediaArtifactType: createCreateMediaArtifactTypeCommandHandler({
      getMediaTypes,
      saveMediaArtifactTypeEvent,
    }),
    updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
      getMediaTypes,
      getMediaArtifactTypes,
      saveMediaArtifactTypeEvent,
    }),
    createMediaArtifactRelationshipType: createCreateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes,
      saveMediaArtifactTypeEvent,
    }),
    getAllMediaTypes: createGetAllMediaTypesQueryHandler(db),
    getMediaType: createGetMediaTypeQueryHandler(db),
    getAllMediaArtifactTypes: createGetAllMediaArtifactTypesQueryHandler(db),
    getMediaArtifactType: createGetMediaArtifactTypeQueryHandler(db),
    getMediaArtifactRelationshipType: createGetMediaArtifactRelationshipTypeQueryHandler(db),
  }
}

export async function setupMediaPermissions(
  createPermissions: (
    permissions: { name: string; description: string | undefined }[],
  ) => Promise<void>,
) {
  await createPermissions(
    Object.values(MediaPermission).map((permission) => ({
      name: permission,
      description: undefined,
    })),
  )
}
