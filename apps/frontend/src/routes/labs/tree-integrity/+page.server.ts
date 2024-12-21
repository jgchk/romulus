import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const response = await locals.di.genres().getGenreTree()

  if (response instanceof Error) {
    return error(response.originalError.statusCode, response.message)
  }

  return { genres: response.tree }
}
