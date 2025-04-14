import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { mediaArtifactTypeSchema } from '$lib/features/media/components/MediaArtifactTypeForm'

import type { PageServerLoad } from './$types'

export const load = (async ({
  locals,
}: {
  locals: { user?: { permissions: { mediaArtifactTypes: { canCreate: boolean } } } }
}) => {
  if (!locals.user?.permissions.mediaArtifactTypes.canCreate) {
    return error(403, { message: 'You do not have permission to create media artifact types' })
  }

  const form = await superValidate(zod(mediaArtifactTypeSchema), { errors: false })
  return { form }
}) satisfies PageServerLoad

export const actions = {
  default: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
    const form = await superValidate(request, zod(mediaArtifactTypeSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const id = crypto.randomUUID()

    const result = await locals.di.media().createMediaArtifactType({ id, ...form.data })
    if (result.isErr()) {
      switch (result.error.name) {
        case 'FetchError': {
          return error(500, result.error.message)
        }
        case 'MediaTypeNotFoundError': {
          return setError(form, 'mediaTypes._errors', result.error.message)
        }
        case 'BadRequestError':
        case 'UnauthenticatedError':
        case 'UnauthorizedError': {
          return error(result.error.statusCode, result.error.message)
        }
        default: {
          result.error satisfies never
        }
      }
    }

    return redirect(303, '/media-artifact-types')
  },
} satisfies Actions
