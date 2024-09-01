import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { releases } = await locals.services.musicCatalog.queries.getAllReleases()
  return { releases }
}
