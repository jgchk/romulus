import { error, fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'

import ArtistsDatabase from '$lib/server/db/controllers/artists'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user?.permissions?.includes('EDIT_ARTISTS')) {
    return error(403, { message: 'You do not have permission to create artists' })
  }
}

export const actions: Actions = {
  default: async ({ locals, request }) => {
    if (!locals.user?.permissions?.includes('EDIT_ARTISTS')) {
      return error(403, { message: 'You do not have permission to create artists' })
    }

    const data = await request.formData()

    const maybeName = z.string().min(1, 'Name is required').safeParse(data.get('name'))
    if (!maybeName.success) {
      return fail(400, {
        action: 'merge' as const,
        errors: { name: maybeName.error.errors.map((err) => err.message) },
      })
    }
    const name = maybeName.data

    const artistsDb = new ArtistsDatabase()
    const [artist] = await artistsDb.insert([{ name }], locals.dbConnection)

    return redirect(302, `/artists/${artist.id}`)
  },
}
