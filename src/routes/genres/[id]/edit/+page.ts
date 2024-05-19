import type { GenreType } from '$lib/types/genres'
import { getStringParam } from '$lib/utils/params'

import type { PageLoad } from './$types'

const GenreFormFields = {
  name: '',
  subtitle: '',
  type: 'STYLE' as GenreType,
  primaryAkas: '',
  secondaryAkas: '',
  tertiaryAkas: '',
  shortDescription: '',
  longDescription: '',
  notes: '',
}

const isGenreFormField = (t: string): t is keyof typeof GenreFormFields => t in GenreFormFields

export const load: PageLoad = ({ url, data }) => {
  const maybeAutoFocus = getStringParam(url, 'focus')
  const autoFocus =
    maybeAutoFocus !== undefined && isGenreFormField(maybeAutoFocus) ? maybeAutoFocus : undefined

  return { autoFocus, ...data }
}
