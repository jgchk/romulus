import { error, redirect } from '@sveltejs/kit'

import { db } from '$lib/server/db'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const ids = await db.genres.findAllIds()

  if (ids.length === 0) {
    return error(404, 'No genres found')
  }

  const randomId = ids[Math.floor(Math.random() * ids.length)].id

  return redirect(302, `/genres/${randomId}`)
}
