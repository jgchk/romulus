import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load = (async ({ locals, params }) => {
  if (!locals.user?.permissions.mediaArtifactTypes.canCreate) {
    return error(403, { message: 'You do not have permission to edit media artifact types' })
  }

  const response = await locals.di.media().getMediaArtifactType(params.id)
  if (response.isErr()) {
    switch (response.error.name) {
      case 'FetchError': {
        return error(500, response.error.message)
      }
      case 'MediaArtifactTypeNotFoundError': {
        return error(404, 'Media artifact type not found')
      }
      default: {
        response.error satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }

  return { mediaArtifactType: response.value.mediaArtifactType }
}) satisfies PageServerLoad
