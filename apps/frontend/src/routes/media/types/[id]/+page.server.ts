import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load = (async ({ params, locals }: { params: { id: string }; locals: App.Locals }) => {
  const response = await locals.di.media().getMediaType(params.id)
  if (response.isErr()) {
    switch (response.error.name) {
      case 'FetchError': {
        return error(500, response.error.message)
      }
      case 'MediaTypeNotFoundError': {
        return error(404, response.error.message)
      }
      default: {
        response.error satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }
  return { mediaType: response.value.mediaType }
}) satisfies PageServerLoad
