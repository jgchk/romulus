import ArtistsDatabase from '$lib/server/db/controllers/artists'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const artistsDb = new ArtistsDatabase()
  const { results: artists } = await artistsDb.findMany({}, locals.dbConnection)
  return { artists }
}
