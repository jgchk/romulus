import { error, fail } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import TracksDatabase from '$lib/server/db/controllers/tracks'
import { releaseTracks, tracks } from '$lib/server/db/schema'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid track ID' })
  }
  const id = maybeId.data

  const tracksDb = new TracksDatabase()
  const maybeTrack = await tracksDb.findById(
    id,
    { include: ['releases-full'] },
    locals.dbConnection,
  )
  if (!maybeTrack) {
    return error(404, { message: 'Track not found' })
  }
  const track = maybeTrack

  return { track }
}

export const actions: Actions = {
  merge: async ({ locals, params, request }) => {
    if (locals.user?.id !== 1) {
      return error(401, 'Unauthorized')
    }

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid track ID' })
    }
    const id = maybeId.data
    console.log({ id })

    const data = await request.formData()

    const maybeOtherId = z.coerce.number().int().safeParse(data.get('id'))
    if (!maybeOtherId.success) {
      return fail(400, {
        action: 'merge' as const,
        errors: { name: maybeOtherId.error.errors.map((err) => err.message) },
      })
    }
    const otherId = maybeOtherId.data

    await locals.dbConnection.transaction(async (tx) => {
      // make all releaseTracks pointing to otherTrack.id point to track.id
      await tx.update(releaseTracks).set({ trackId: id }).where(eq(releaseTracks.trackId, otherId))

      // delete otherTrack
      await tx.delete(tracks).where(eq(tracks.id, otherId))
    })
  },
}
