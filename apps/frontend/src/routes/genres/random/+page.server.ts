import { error, redirect } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const randomId = await locals.di.genreQueryService().getRandomGenreId()

  if (randomId === undefined) {
    return error(404, 'No genres found')
  }

  return redirect(302, `/genres/${randomId}`)
}
