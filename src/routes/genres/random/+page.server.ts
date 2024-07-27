import { error, redirect } from '@sveltejs/kit'

import { GenresDatabase } from '$lib/server/db/controllers/genre'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const genresDb = new GenresDatabase()
  const ids = await genresDb.findAllIds(locals.dbConnection)

  if (ids.length === 0) {
    return error(404, 'No genres found')
  }

  const randomId = ids[Math.floor(Math.random() * ids.length)]

  return redirect(302, `/genres/${randomId}`)
}
