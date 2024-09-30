import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { tracks } = await locals.services.musicCatalog.queries.getAllTracks()
  return { tracks }
}