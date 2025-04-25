import { error } from '@sveltejs/kit'

import { type LayoutServerLoad } from './$types'

export const load = (async ({ locals }) => {
  const mediaArtifactTypesResponse = await locals.di.media().getAllMediaArtifactTypes()
  if (mediaArtifactTypesResponse.isErr()) {
    switch (mediaArtifactTypesResponse.error.name) {
      case 'FetchError': {
        return error(500, mediaArtifactTypesResponse.error.message)
      }
      default: {
        mediaArtifactTypesResponse.error.name satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }

  return {
    mediaArtifactTypes: mediaArtifactTypesResponse.value.mediaArtifactTypes,
    mediaArtifactRelationshipTypes: mediaArtifactTypesResponse.value.mediaArtifactRelationshipTypes,
  }
}) satisfies LayoutServerLoad
