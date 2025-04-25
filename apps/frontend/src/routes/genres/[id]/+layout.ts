import { error } from '@sveltejs/kit'

import { type LayoutLoad } from './$types'

export const load: LayoutLoad = ({ params }) => {
  const id = parseInt(params.id)

  if (isNaN(id)) {
    return error(400, 'Invalid genre ID')
  }

  return { id }
}
