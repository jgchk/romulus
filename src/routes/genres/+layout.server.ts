import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { ifDefined } from '$lib/utils/types'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals, cookies }) => {
  const genresDb = new GenresDatabase(locals.dbConnection)
  const genres = genresDb.findAllTree()

  const leftPaneSize = ifDefined(cookies.get('genres.leftPaneSize'), (v) => {
    const value = Number.parseInt(v)
    if (!Number.isNaN(value)) return value
  })

  return { leftPaneSize, streamed: { genres } }
}
