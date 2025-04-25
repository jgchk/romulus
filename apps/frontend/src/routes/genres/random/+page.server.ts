import { error, redirect } from '@sveltejs/kit'

import { type PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const response = await locals.di.genres().getRandomGenreId()
  if (response.isErr()) {
    return error(500, response.error.message)
  }
  const randomId = response.value.genre

  if (randomId === undefined) {
    return error(404, 'No genres found')
  }

  return redirect(302, `/genres/${randomId}`)
}
