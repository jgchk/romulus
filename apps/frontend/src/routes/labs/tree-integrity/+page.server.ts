import { error } from '@sveltejs/kit'

import { type PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const response = await locals.di.genres().getGenreTree()

  if (response.isErr()) {
    return error(500, response.error.message)
  }

  return { genres: response.value.tree }
}
