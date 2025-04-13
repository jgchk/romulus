import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load = (async ({ locals }: { locals: App.Locals }) => {
  const response = await locals.di.media().getAllMediaArtifactTypes()
  if (response.isErr()) {
    switch (response.error.name) {
      case 'FetchError': {
        return error(500, response.error.message)
      }
      default: {
        response.error.name satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }
  return {
    mediaArtifactTypes: response.value.mediaArtifactTypes,
    mediaArtifactRelationshipTypes: response.value.mediaArtifactRelationshipTypes,
  }
}) satisfies PageServerLoad
