import {
  createCreateMediaTypeCommandHandler,
  type CreateMediaTypeCommandHandler,
} from './commands/application/create-media-type.js'
import {
  createDeleteMediaTypeCommandHandler,
  type DeleteMediaTypeCommandHandler,
} from './commands/application/delete-media-type.js'
import {
  createUpdateMediaTypeCommandHandler,
  type UpdateMediaTypeCommandHandler,
} from './commands/application/update-media-type.js'
import { MediaPermission } from './commands/domain/permissions.js'
import type { MediaTypeEvent } from './common/domain/events.js'
import {
  createGetAllMediaTypesQueryHandler,
  type GetAllMediaTypesQueryHandler,
} from './queries/application/get-all-media-types.js'
import type { IDrizzleConnection } from './queries/infrastructure/drizzle-database.js'
import type { MaybePromise } from './utils.js'

export type MediaApplication = {
  createMediaType: CreateMediaTypeCommandHandler
  deleteMediaType: DeleteMediaTypeCommandHandler
  updateMediaType: UpdateMediaTypeCommandHandler
  getAllMediaTypes: GetAllMediaTypesQueryHandler
}

export function createMediaApplication(
  getEvents: () => MaybePromise<MediaTypeEvent[]>,
  saveEvent: (event: MediaTypeEvent) => MaybePromise<void>,
  db: IDrizzleConnection,
): MediaApplication {
  return {
    createMediaType: createCreateMediaTypeCommandHandler(saveEvent),
    deleteMediaType: createDeleteMediaTypeCommandHandler(saveEvent),
    updateMediaType: createUpdateMediaTypeCommandHandler(getEvents, saveEvent),
    getAllMediaTypes: createGetAllMediaTypesQueryHandler(db),
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
