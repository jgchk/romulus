import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const genres = await locals.di.genreQueryService().getGenreTree()

  return { genres }
}
