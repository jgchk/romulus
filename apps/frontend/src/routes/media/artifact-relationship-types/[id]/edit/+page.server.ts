import { error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { mediaArtifactRelationshipTypeSchema } from '$lib/features/media/components/MediaArtifactRelationshipTypeForm'
import { routes } from '$lib/routes'

import type { Actions, PageServerLoad } from './$types'

export const load = (async ({ locals, params }) => {
  if (!locals.user?.permissions.mediaArtifactTypes.canCreate) {
    return error(403, {
      message: 'You do not have permission to edit media artifact relationship types',
    })
  }

  const response = await locals.di.media().getMediaArtifactRelationshipType(params.id)
  if (response.isErr()) {
    switch (response.error.name) {
      case 'FetchError': {
        return error(500, response.error.message)
      }
      case 'MediaArtifactRelationshipTypeNotFoundError': {
        return error(404, 'Media artifact relationship type not found')
      }
      default: {
        response.error satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }

  const form = await superValidate(
    response.value.mediaArtifactRelationshipType,
    zod(mediaArtifactRelationshipTypeSchema),
    { errors: false },
  )

  return { form, id: params.id }
}) satisfies PageServerLoad

export const actions = {
  default: async ({ request, locals, params }) => {
    const form = await superValidate(request, zod(mediaArtifactRelationshipTypeSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const result = await locals.di.media().updateMediaArtifactRelationshipType(params.id, form.data)
    if (result.isErr()) {
      switch (result.error.name) {
        case 'FetchError': {
          return error(500, result.error.message)
        }
        case 'MediaArtifactTypeNotFoundError': {
          const id = result.error.details.id
          if (form.data.parentMediaArtifactType === id) {
            return setError(form, 'parentMediaArtifactType', result.error.message)
          } else {
            return setError(form, 'childMediaArtifactTypes._errors', result.error.message)
          }
        }
        case 'BadRequestError':
        case 'MediaArtifactRelationshipTypeNotFoundError':
        case 'UnauthenticatedError':
        case 'UnauthorizedError': {
          return error(result.error.statusCode, result.error.message)
        }
        default: {
          result.error satisfies never
        }
      }
    }

    return redirect(303, routes.media.artifactTypes.relationships.route())
  },
} satisfies Actions
