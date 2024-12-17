import { error, redirect } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const response = await locals.di.genres().queries().getRandomGenreId()
  if (response instanceof Error) {
    return error(response.originalError.statusCode, response.message)
  }
  const randomId = response.genre

  if (randomId === undefined) {
    return error(404, 'No genres found')
  }

  return redirect(302, `/genres/${randomId}`)
}
