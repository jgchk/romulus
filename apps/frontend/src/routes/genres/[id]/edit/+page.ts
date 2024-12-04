import { getStringParam } from '$lib/utils/params'

import { isGenreFormField } from '../../GenreForm'
import type { PageLoad } from './$types'

export const load: PageLoad = ({ url, data }) => {
  const maybeAutoFocus = getStringParam(url, 'focus')
  const autoFocus =
    maybeAutoFocus !== undefined && isGenreFormField(maybeAutoFocus) ? maybeAutoFocus : undefined

  return { autoFocus, ...data }
}
