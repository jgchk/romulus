import { error } from '@sveltejs/kit'

import type { LayoutServerLoad } from './$types'

export const load = (async ({ locals }) => {
  const mediaTypesResponse = await locals.di.media().getAllMediaTypes()
  if (mediaTypesResponse.isErr()) {
    switch (mediaTypesResponse.error.name) {
      case 'FetchError': {
        return error(500, mediaTypesResponse.error.message)
      }
      default: {
        mediaTypesResponse.error.name satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }

  return {
    mediaTypes: new Map(
      mediaTypesResponse.value.mediaTypes.map((mediaType) => [mediaType.id, mediaType]),
    ),
  }
}) satisfies LayoutServerLoad
