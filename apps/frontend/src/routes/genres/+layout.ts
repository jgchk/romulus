import { browser } from '$app/environment'
import { createGenreDatabase } from '$lib/genre-db/infrastructure/db'

import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ data }) => {
  if (browser) {
    const genreDatabase = await createGenreDatabase()
    return { ...data, genreDatabase }
  } else {
    return { ...data }
  }
}
