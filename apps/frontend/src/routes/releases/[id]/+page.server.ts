import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'

import type { PageServerLoad } from './$types'
import type { Actions } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid release ID' })
  }
  const id = maybeId.data

  const { release } = await locals.di.musicCatalogQueryService().getRelease(id)

  if (!release) {
    return error(404, { message: 'Release not found' })
  }

  return { release }
}

export const actions: Actions = {
  delete: async ({ params, locals, setHeaders }) => {
    if (!locals.user?.permissions?.includes('EDIT_RELEASES')) {
      return error(403, { message: 'You do not have permission to delete releases' })
    }

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid release ID' })
    }
    const id = maybeId.data

    await locals.di.musicCatalogCommandService().deleteRelease(id)

    setHeaders({ Location: '/releases' })
    return redirect(303, '/releases')
  },
}
