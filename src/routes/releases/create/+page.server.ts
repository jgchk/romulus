import { type ActionFailure, error, fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'

import { InvalidTrackError } from '$lib/server/features/music-catalog/commands/application/errors/invalid-track'
import { NonexistentTrackError } from '$lib/server/features/music-catalog/commands/application/errors/nonexistent-track'
import { NonexistentDateError } from '$lib/server/features/music-catalog/commands/domain/errors/nonexistent-date'
import { ReleaseDatePrecisionError } from '$lib/server/features/music-catalog/commands/domain/errors/release-date-precision'

import type { Actions, PageServerLoad } from './$types'
import { InvalidInputError, parseFormData, type ReleaseErrors } from './server-state'

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user?.permissions?.includes('EDIT_RELEASES')) {
    return error(403, { message: 'You do not have permission to create releases' })
  }

  const artists = await getInitialArtists(url, locals)

  return { initialState: { artists } }
}

async function getInitialArtists(url: URL, locals: App.Locals) {
  const maybeArtistId = z.coerce
    .number()
    .int()
    .optional()
    .safeParse(url.searchParams.get('artist') ?? undefined)

  if (maybeArtistId.success === false) {
    return []
  }

  const artistId = maybeArtistId.data

  if (artistId === undefined) {
    return []
  }

  const { artist } = await locals.services.musicCatalog.queries.getArtist(artistId)

  if (artist === undefined) {
    return []
  }

  return [{ id: artist.id, name: artist.name }]
}

export const actions: Actions = {
  default: async ({ locals, request }) => {
    if (!locals.user?.permissions?.includes('EDIT_RELEASES')) {
      return error(403, { message: 'You do not have permission to create releases' })
    }

    const form = await request.formData()
    const formData = form.get('data')
    if (formData === null) {
      return error(400, { message: 'Missing form data' })
    }
    if (typeof formData !== 'string') {
      return error(400, { message: 'Invalid form data' })
    }

    const createReleaseRequest = parseFormData(formData)

    if (createReleaseRequest instanceof InvalidInputError) {
      return failForm(createReleaseRequest.errors)
    }

    const releaseId =
      await locals.services.musicCatalog.commands.createRelease(createReleaseRequest)

    if (releaseId instanceof Error) {
      return handleCreateReleaseError(releaseId)
    }

    return redirect(302, `/releases/${releaseId}`)
  },
}

function handleCreateReleaseError(
  error:
    | ReleaseDatePrecisionError
    | NonexistentDateError
    | NonexistentTrackError
    | InvalidTrackError,
): ActionFailure<{ errors: ReleaseErrors }> {
  if (error instanceof ReleaseDatePrecisionError) {
    return failForm({
      day: ['Cannot specify a release day without specifying a month'],
    })
  }

  if (error instanceof NonexistentDateError) {
    return failForm({
      day: ['Must be a real date'],
    })
  }

  if (error instanceof NonexistentTrackError) {
    return failForm({
      tracks: {
        [error.index]: { id: ['Track does not exist'] },
      },
    })
  }

  if (error instanceof InvalidTrackError) {
    return failForm({
      tracks: {
        [error.index]: { id: [error.originalError.message] },
      },
    })
  }

  // Exhaustive check
  const _exhaustiveCheck: never = error
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unhandled error type: ${_exhaustiveCheck}`)
}

const failForm = (errors: ReleaseErrors) => fail(400, { errors })
