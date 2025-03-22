import { createGenreStore } from '$lib/features/genres/queries/infrastructure'
import { ifDefined } from '$lib/utils/types'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals, cookies }) => {
  const genres = locals.di
    .genres()
    .getGenreTree()
    .then((res) => {
      if (res.isErr()) throw res.error
      return res.value.tree
    })
    .then((genres) => createGenreStore(genres))

  const leftPaneSize = ifDefined(cookies.get('genres.leftPaneSize'), (v) => {
    const value = Number.parseInt(v)
    if (!Number.isNaN(value)) return value
  })

  return { leftPaneSize, streamed: { genres } }
}
