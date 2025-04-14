import { error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { mediaArtifactTypeSchema } from '$lib/features/media/components/MediaArtifactTypeForm'

import type { Actions, PageServerLoad } from './$types'

export const load = (async ({ locals, params }) => {
  if (!locals.user?.permissions.mediaArtifactTypes.canCreate) {
    return error(403, { message: 'You do not have permission to edit media artifact types' })
  }

  const response = await locals.di.media().getMediaArtifactType(params.id)
  if (response.isErr()) {
    switch (response.error.name) {
      case 'FetchError': {
        return error(500, response.error.message)
      }
      case 'MediaArtifactTypeNotFoundError': {
        return error(404, 'Media artifact type not found')
      }
      default: {
        response.error satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }

  const form = await superValidate(response.value.mediaArtifactType, zod(mediaArtifactTypeSchema), {
    errors: false,
  })

  return { id: params.id, form }
}) satisfies PageServerLoad

export const actions = {
  default: async ({ request, locals, params }) => {
    const form = await superValidate(request, zod(mediaArtifactTypeSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const result = await locals.di.media().updateMediaArtifactType(params.id, form.data)
    if (result.isErr()) {
      switch (result.error.name) {
        case 'FetchError': {
          return error(500, result.error.message)
        }
        case 'BadRequestError':
        case 'UnauthenticatedError':
        case 'UnauthorizedError':
        case 'MediaArtifactTypeNotFoundError': {
          return error(result.error.statusCode, result.error.message)
        }
        case 'MediaTypeNotFoundError': {
          return setError(form, 'mediaTypes._errors', result.error.message)
        }
        default: {
          result.error satisfies never
        }
      }
    }

    return redirect(303, '/media-artifact-types')
  },
} satisfies Actions
