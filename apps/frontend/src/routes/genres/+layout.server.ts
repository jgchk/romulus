import { ifDefined } from '$lib/utils/types'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals, cookies }) => {
  // eslint-disable-next-line returned-errors/enforce-error-handling
  const genres = locals.di
    .genres()
    .getGenreTree()
    .then((res) => {
      if (res instanceof Error) throw res
      return res.tree
    })

  const leftPaneSize = ifDefined(cookies.get('genres.leftPaneSize'), (v) => {
    const value = Number.parseInt(v)
    if (!Number.isNaN(value)) return value
  })

  return { leftPaneSize, streamed: { genres } }
}
