import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { artists } = await locals.services.musicCatalog.queries.getAllArtists()
  return { artists }
}
