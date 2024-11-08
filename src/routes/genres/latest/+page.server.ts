import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const history = await locals.services.genre.queries.getLatestGenreUpdates()

  return { genreHistory: history }
}
