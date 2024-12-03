import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { artists } = await locals.di.musicCatalogQueryService().getAllArtists()
  return { artists }
}
