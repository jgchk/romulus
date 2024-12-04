import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { tracks } = await locals.di.musicCatalogQueryService().getAllTracks()
  return { tracks }
}
