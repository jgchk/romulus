import { error, redirect } from '@sveltejs/kit'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import type { CreateReleaseRequest } from '$lib/server/features/music-catalog/commands/application/create-release'
import { optionalString } from '$lib/utils/validators'

import type { Actions, PageServerLoad } from './$types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  artists: z
    .object({ id: z.number().int(), name: z.string() })
    .array()
    .min(1, 'At least one artist is required'),
  art: optionalString,
  tracks: z
    .object({
      title: z.string().min(1, 'Title is required'),
      artists: z
        .object({ id: z.number().int(), name: z.string() })
        .array()
        .min(1, 'At least one artist is required'),
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

    const createReleaseRequest: CreateReleaseRequest = {
      ...form.data,
      artists: form.data.artists.map((artist) => artist.id),
      tracks: form.data.tracks.map((track) => ({
        ...track,
        artists: track.artists.map((artist) => artist.id),
      })),
    }

    const releaseId =
      await locals.services.musicCatalog.commands.createRelease(createReleaseRequest)

    return redirect(302, `/releases/${releaseId}`)
  },
}
