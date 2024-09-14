import { error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import type { CreateReleaseRequest } from '$lib/server/features/music-catalog/commands/application/create-release'
import { NonexistentDateError } from '$lib/server/features/music-catalog/commands/domain/errors/nonexistent-date'
import { ReleaseDatePrecisionError } from '$lib/server/features/music-catalog/commands/domain/errors/release-date-precision'
import { optionalString } from '$lib/utils/validators'

import type { Actions, PageServerLoad } from './$types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  artists: z
    .object({ id: z.number().int(), name: z.string() })
    .array()
    .min(1, 'At least one artist is required'),
  art: optionalString,
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional(),
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

    let releaseDate: CreateReleaseRequest['releaseDate']
    if (form.data.year === undefined) {
      if (form.data.month !== undefined || form.data.day !== undefined) {
        return setError(form, 'year', 'Year is required')
      }
    } else {
      releaseDate = {
        year: form.data.year,
        month: form.data.month,
        day: form.data.day,
      }
    }

    const createReleaseRequest: CreateReleaseRequest = {
      ...form.data,
      art: form.data.art,
      releaseDate,
      artists: form.data.artists.map((artist) => artist.id),
      tracks: form.data.tracks.map((track) => ({
        ...track,
        artists: track.artists.map((artist) => artist.id),
      })),
    }

    const releaseId =
      await locals.services.musicCatalog.commands.createRelease(createReleaseRequest)

    if (releaseId instanceof ReleaseDatePrecisionError) {
      return setError(form, 'day', 'Cannot specify a release day without specifying a month')
    }
    if (releaseId instanceof NonexistentDateError) {
      return setError(form, 'day', 'Must be a real date')
    }

    return redirect(302, `/releases/${releaseId}`)
  },
}
