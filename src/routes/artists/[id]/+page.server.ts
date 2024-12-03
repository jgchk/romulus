import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'

import type { PageServerLoad } from './$types'
import type { Actions } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid artist ID' })
  }
  const id = maybeId.data

  const { artist } = await locals.di.musicCatalogQueryService().getArtist(id)

  if (!artist) {
    return error(404, { message: 'Artist not found' })
  }

  return { artist }
}

export const actions: Actions = {
  delete: async ({ params, locals, setHeaders }) => {
    if (!locals.user?.permissions?.includes('EDIT_ARTISTS')) {
      return error(403, { message: 'You do not have permission to delete artists' })
    }

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid artist ID' })
    }
    const id = maybeId.data

    await locals.di.musicCatalogCommandService().deleteArtist(id)

    setHeaders({ Location: '/artists' })
    return redirect(303, '/artists')
  },
}
