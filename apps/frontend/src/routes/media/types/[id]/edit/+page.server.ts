import { error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { mediaTypeSchema } from '$lib/features/media/components/MediaTypeForm'
import { routes } from '$lib/routes'

import { type Actions, type PageServerLoad } from './$types'

export const load = (async ({ params, locals }: { params: { id: string }; locals: App.Locals }) => {
  if (!locals.user?.permissions.mediaTypes.canCreate) {
    return error(403, { message: 'You do not have permission to create media types' })
  }

  const response = await locals.di.media().getMediaType(params.id)
  if (response.isErr()) {
    switch (response.error.name) {
      case 'FetchError': {
        return error(500, response.error.message)
      }
      case 'MediaTypeNotFoundError': {
        return error(404, response.error.message)
      }
      default: {
        response.error satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }

  const form = await superValidate(response.value.mediaType, zod(mediaTypeSchema), {
    errors: false,
  })

  return { id: params.id, form }
}) satisfies PageServerLoad

export const actions = {
  default: async ({ request, locals, params }) => {
    const form = await superValidate(request, zod(mediaTypeSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const result = await locals.di.media().updateMediaType(params.id, form.data)
    if (result.isErr()) {
      switch (result.error.name) {
        case 'FetchError': {
          return error(500, result.error.message)
        }
        case 'BadRequestError':
        case 'UnauthenticatedError':
        case 'UnauthorizedError':
        case 'MediaTypeNotFoundError': {
          return error(result.error.statusCode, result.error.message)
        }
        case 'MediaTypeTreeCycleError': {
          return setError(form, 'parents._errors', result.error.message)
        }
        default: {
          result.error satisfies never
        }
      }
    }

    return redirect(303, routes.media.types.route())
  },
} satisfies Actions
