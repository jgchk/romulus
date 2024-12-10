import { ifDefined } from '$lib/utils/types'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals, cookies }) => {
  const genres = locals.di.genreQueryService().getGenreTree()

  const leftPaneSize = ifDefined(cookies.get('genres.leftPaneSize'), (v) => {
    const value = Number.parseInt(v)
    if (!Number.isNaN(value)) return value
  })

  return { leftPaneSize, streamed: { genres } }
}