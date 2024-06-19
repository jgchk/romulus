import { db } from '$lib/server/db'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const ids = await db.query.genres.findMany({
    columns: {
      id: true,
    },
  })

  const randomId = ids[Math.floor(Math.random() * ids.length)].id

  return redirect(302, `/genres/${randomId}`)
}
