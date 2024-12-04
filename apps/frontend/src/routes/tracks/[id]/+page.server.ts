import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid track ID' })
  }
  const id = maybeId.data

  const { track } = await locals.di.musicCatalogQueryService().getTrack(id)

  if (!track) {
    return error(404, { message: 'Track not found' })
  }

  return { track }
}

export const actions: Actions = {
  delete: async ({ params, locals, setHeaders }) => {
    if (!locals.user?.permissions?.includes('EDIT_RELEASES')) {
      return error(403, { message: 'You do not have permission to delete tracks' })
    }

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid track ID' })
    }
    const id = maybeId.data

    await locals.di.musicCatalogCommandService().deleteTrack(id)

    setHeaders({ Location: '/tracks' })
    return redirect(303, '/tracks')
  },
}
