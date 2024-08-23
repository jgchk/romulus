import { error, redirect } from '@sveltejs/kit'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import ReleasesDatabase from '$lib/server/db/controllers/releases'

import type { Actions, PageServerLoad } from './$types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  artists: z.number().int().array().min(1, 'At least one artist is required'),
  releaseDate: z.string().min(1, 'Release date is required'),
  art: z.string().min(1, 'Art URL is required'),
  tracks: z
    .object({
      title: z.string().min(1, 'Title is required'),
      artists: z.number().int().array().min(1, 'At least one artist is required'),
    })
    .array(),
})

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user?.permissions?.includes('EDIT_RELEASES')) {
    return error(403, { message: 'You do not have permission to create releases' })
  }

  const form = await superValidate(zod(schema))
  return { form }
}

export const actions: Actions = {
  default: async ({ locals, request }) => {
    if (!locals.user?.permissions?.includes('EDIT_RELEASES')) {
      return error(403, { message: 'You do not have permission to create releases' })
    }

    const form = await superValidate(request, zod(schema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const releasesDb = new ReleasesDatabase()
    const [release] = await releasesDb.insert([form.data], locals.dbConnection)

    return redirect(302, `/releases/${release.id}`)
  },
}
