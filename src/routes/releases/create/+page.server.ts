import { error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import type { CreateReleaseRequest } from '$lib/server/features/music-catalog/commands/application/commands/create-release'
import { InvalidTrackError } from '$lib/server/features/music-catalog/commands/application/errors/invalid-track'
import { NonexistentTrackError } from '$lib/server/features/music-catalog/commands/application/errors/nonexistent-track'
import { NonexistentDateError } from '$lib/server/features/music-catalog/commands/domain/errors/nonexistent-date'
import { ReleaseDatePrecisionError } from '$lib/server/features/music-catalog/commands/domain/errors/release-date-precision'
import { optionalString } from '$lib/utils/validators'

import type { Actions, PageServerLoad } from './$types'

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
      title: form.data.title,
      art: form.data.art,
      releaseDate,
      artists: form.data.artists.map((artist) => artist.id),
      tracks: [],
    }

    for (const [i, track] of form.data.tracks.entries()) {
      if ('id' in track) {
        // TODO: add override properties
        createReleaseRequest.tracks.push({ id: track.id })
      } else {
        let durationMs: number | undefined = undefined
        if (track.duration.length > 0) {
          try {
            durationMs = convertToMilliseconds(track.duration)
          } catch {
            return setError(
              form,
              `tracks[${i}].duration`,
              'Invalid duration format. Must be in the format HH:MM:SS',
            )
          }
        }

        createReleaseRequest.tracks.push({
          title: track.title,
          artists: track.artists.map((artist) => artist.id),
          durationMs,
        })
      }
    }

    const releaseId =
      await locals.services.musicCatalog.commands.createRelease(createReleaseRequest)

    if (releaseId instanceof ReleaseDatePrecisionError) {
      return setError(form, 'day', 'Cannot specify a release day without specifying a month')
    }
    if (releaseId instanceof NonexistentDateError) {
      return setError(form, 'day', 'Must be a real date')
    }
    if (releaseId instanceof NonexistentTrackError) {
      return setError(form, `tracks[${releaseId.index}].id`, 'Track does not exist')
    }
    if (releaseId instanceof InvalidTrackError) {
      return setError(form, `tracks[${releaseId.index}].duration`, releaseId.originalError.message)
    }

    return redirect(302, `/releases/${releaseId}`)
  },
}

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
      duration: z.string(),
    })
    .or(
      z.object({
        id: z.number().int(),
        data: z.object({
          title: z.string().min(1, 'Title is required'),
          artists: z
            .object({ id: z.number().int(), name: z.string() })
            .array()
            .min(1, 'At least one artist is required'),
          duration: z.string(),
        }),
        overrides: z.object({
          title: optionalString,
          artists: z
            .object({ id: z.number().int(), name: z.string() })
            .array()
            .min(1, 'At least one artist is required')
            .optional(),
          duration: optionalString,
        }),
      }),
    )
    .array(),
})

function convertToMilliseconds(input: string): number {
  const parts = input.split(':')
  let hours = 0
  let minutes = 0
  let seconds = 0

  if (parts.length === 3) {
    hours = parseFloat(parts[0])
    minutes = parseFloat(parts[1])
    seconds = parseFloat(parts[2])
  } else if (parts.length === 2) {
    minutes = parseFloat(parts[0])
    seconds = parseFloat(parts[1])
  } else if (parts.length === 1) {
    seconds = parseFloat(parts[0])
  } else {
    throw new Error('Invalid input format')
  }

  return (hours * 3600 + minutes * 60 + seconds) * 1000
}
