import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { releases } = await locals.di.musicCatalogQueryService().getAllReleases()
  return { releases }
}
