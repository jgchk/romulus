import type { CreateMediaArtifactRelationshipTypeCommandHandler } from './commands/application/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import { createCreateMediaArtifactRelationshipTypeCommandHandler } from './commands/application/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import type { UpdateMediaArtifactRelationshipTypeCommandHandler } from './commands/application/media-artifact-relationship-types/update-media-artifact-relationship-type.js'
import { createUpdateMediaArtifactRelationshipTypeCommandHandler } from './commands/application/media-artifact-relationship-types/update-media-artifact-relationship-type.js'
import type { CreateMediaArtifactTypeCommandHandler } from './commands/application/media-artifact-types/create-media-artifact-type.js'
import { createCreateMediaArtifactTypeCommandHandler } from './commands/application/media-artifact-types/create-media-artifact-type.js'
import type { DeleteMediaArtifactTypeCommandHandler } from './commands/application/media-artifact-types/delete-media-artifact-type.js'
import { createDeleteMediaArtifactTypeCommandHandler } from './commands/application/media-artifact-types/delete-media-artifact-type.js'
import type { UpdateMediaArtifactTypeCommandHandler } from './commands/application/media-artifact-types/update-media-artifact-type.js'
import { createUpdateMediaArtifactTypeCommandHandler } from './commands/application/media-artifact-types/update-media-artifact-type.js'
import type { CreateMediaArtifactCommandHandler } from './commands/application/media-artifacts/create-media-artifact.js'
import { createCreateMediaArtifactCommandHandler as createCreateMediaArtifactCommandHandler } from './commands/application/media-artifacts/create-media-artifact.js'
import type { CreateMediaTypeCommandHandler } from './commands/application/media-types/create-media-type.js'
import { createCreateMediaTypeCommandHandler } from './commands/application/media-types/create-media-type.js'
import type { DeleteMediaTypeCommandHandler } from './commands/application/media-types/delete-media-type.js'
import { createDeleteMediaTypeCommandHandler } from './commands/application/media-types/delete-media-type.js'
import type { UpdateMediaTypeCommandHandler } from './commands/application/media-types/update-media-type.js'
import { createUpdateMediaTypeCommandHandler } from './commands/application/media-types/update-media-type.js'
import type { MediaArtifactTypesProjection } from './commands/domain/media-artifact-types/media-artifact-types-projection.js'
import type { MediaTypesProjection } from './commands/domain/media-types/media-types-projection.js'
import { MediaPermission } from './commands/domain/permissions.js'
import type {
  MediaArtifactEvent,
  MediaArtifactTypeEvent,
  MediaTypeEvent,
} from './common/domain/events.js'
import type { GetMediaArtifactRelationshipTypeQueryHandler } from './queries/application/media-artifact-relationship-types/get-media-artifact-relationship-type.js'
import { createGetMediaArtifactRelationshipTypeQueryHandler } from './queries/application/media-artifact-relationship-types/get-media-artifact-relationship-type.js'
import type { GetAllMediaArtifactTypesQueryHandler } from './queries/application/media-artifact-types/get-all-media-artifact-types.js'
import { createGetAllMediaArtifactTypesQueryHandler } from './queries/application/media-artifact-types/get-all-media-artifact-types.js'
import type { GetMediaArtifactTypeQueryHandler } from './queries/application/media-artifact-types/get-media-artifact-type.js'
import { createGetMediaArtifactTypeQueryHandler } from './queries/application/media-artifact-types/get-media-artifact-type.js'
import type { GetMediaArtifactTypesByMediaTypeQueryHandler } from './queries/application/media-artifact-types/get-media-artifact-types-by-media-type.js'
import { createGetMediaArtifactTypesByMediaTypeQueryHandler } from './queries/application/media-artifact-types/get-media-artifact-types-by-media-type.js'
import type { GetAllMediaTypesQueryHandler } from './queries/application/media-types/get-all-media-types.js'
import { createGetAllMediaTypesQueryHandler } from './queries/application/media-types/get-all-media-types.js'
import type { GetMediaTypeQueryHandler } from './queries/application/media-types/get-media-type.js'
import { createGetMediaTypeQueryHandler } from './queries/application/media-types/get-media-type.js'
import type { IDrizzleConnection } from './queries/infrastructure/drizzle-database.js'
import type { MaybePromise } from './utils.js'

export type MediaApplication = {
  createMediaType: CreateMediaTypeCommandHandler
  updateMediaType: UpdateMediaTypeCommandHandler
  deleteMediaType: DeleteMediaTypeCommandHandler
  createMediaArtifactType: CreateMediaArtifactTypeCommandHandler
  updateMediaArtifactType: UpdateMediaArtifactTypeCommandHandler
  deleteMediaArtifactType: DeleteMediaArtifactTypeCommandHandler
  createMediaArtifactRelationshipType: CreateMediaArtifactRelationshipTypeCommandHandler
  updateMediaArtifactRelationshipType: UpdateMediaArtifactRelationshipTypeCommandHandler
  createMediaArtifact: CreateMediaArtifactCommandHandler
  getAllMediaTypes: GetAllMediaTypesQueryHandler
  getMediaType: GetMediaTypeQueryHandler
  getAllMediaArtifactTypes: GetAllMediaArtifactTypesQueryHandler
  getMediaArtifactTypesByMediaType: GetMediaArtifactTypesByMediaTypeQueryHandler
  getMediaArtifactType: GetMediaArtifactTypeQueryHandler
  getMediaArtifactRelationshipType: GetMediaArtifactRelationshipTypeQueryHandler
}

export function createMediaApplication({
  getMediaTypes,
  getMediaArtifactTypes,
  saveMediaTypeEvent,
  saveMediaArtifactTypeEvent,
  saveMediaArtifactEvent,
  db,
}: {
  getMediaTypes: () => MaybePromise<MediaTypesProjection>
  getMediaArtifactTypes: () => MaybePromise<MediaArtifactTypesProjection>
  saveMediaTypeEvent: (event: MediaTypeEvent) => MaybePromise<void>
  saveMediaArtifactTypeEvent: (event: MediaArtifactTypeEvent) => MaybePromise<void>
  saveMediaArtifactEvent: (id: string, event: MediaArtifactEvent) => MaybePromise<void>
  db: IDrizzleConnection
}): MediaApplication {
  return {
    createMediaType: createCreateMediaTypeCommandHandler(getMediaTypes, saveMediaTypeEvent),
    updateMediaType: createUpdateMediaTypeCommandHandler(getMediaTypes, saveMediaTypeEvent),
    deleteMediaType: createDeleteMediaTypeCommandHandler(saveMediaTypeEvent),
    createMediaArtifactType: createCreateMediaArtifactTypeCommandHandler({
      getMediaTypes,
      saveMediaArtifactTypeEvent,
    }),
    updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
      getMediaTypes,
      getMediaArtifactTypes,
      saveMediaArtifactTypeEvent,
    }),
    deleteMediaArtifactType: createDeleteMediaArtifactTypeCommandHandler({
      saveMediaArtifactTypeEvent,
    }),
    createMediaArtifactRelationshipType: createCreateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes,
      saveMediaArtifactTypeEvent,
    }),
    updateMediaArtifactRelationshipType: createUpdateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes,
      saveMediaArtifactTypeEvent,
    }),
    createMediaArtifact: createCreateMediaArtifactCommandHandler(
      getMediaArtifactTypes,
      saveMediaArtifactEvent,
    ),
    getAllMediaTypes: createGetAllMediaTypesQueryHandler(db),
    getMediaType: createGetMediaTypeQueryHandler(db),
    getAllMediaArtifactTypes: createGetAllMediaArtifactTypesQueryHandler(db),
    getMediaArtifactTypesByMediaType: createGetMediaArtifactTypesByMediaTypeQueryHandler(db),
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
