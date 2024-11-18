import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const genres = await locals.services.genre.queries.getGenreTree()

  return { genres }
}
