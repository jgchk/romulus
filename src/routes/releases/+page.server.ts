import ReleasesDatabase from '$lib/server/db/controllers/releases'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const releasesDb = new ReleasesDatabase()
  const { results: releases } = await releasesDb.findMany(
    { include: ['artists-full'] },
    locals.dbConnection,
  )
  return { releases }
}
