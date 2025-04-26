import { isGenreFormField } from '$lib/features/genres/components/GenreForm'
import { getStringParam } from '$lib/utils/params'

import type { PageLoad } from './$types'

export const load: PageLoad = ({ url, data }) => {
  const maybeAutoFocus = getStringParam(url, 'focus')
  const autoFocus =
    maybeAutoFocus !== undefined && isGenreFormField(maybeAutoFocus) ? maybeAutoFocus : undefined

  return { autoFocus, ...data }
}
