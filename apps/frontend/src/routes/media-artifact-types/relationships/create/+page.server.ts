import { type Actions, error } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { mediaArtifactRelationshipTypeSchema } from '$lib/features/media/components/MediaArtifactRelationshipTypeForm'

import type { PageServerLoad } from './$types'

export const load = (async ({ locals }) => {
  if (!locals.user?.permissions.mediaArtifactTypes.canCreate) {
    return error(403, {
      message: 'You do not have permission to create media artifact relationship types',
    })
  }

  const form = await superValidate(zod(mediaArtifactRelationshipTypeSchema), { errors: false })

  const response = await locals.di.media().getAllMediaArtifactTypes()
  if (response.isErr()) {
    switch (response.error.name) {
      case 'FetchError': {
        return error(500, response.error.message)
      }
      default: {
        response.error.name satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }

  return { form, mediaArtifactTypes: response.value.mediaArtifactTypes }
}) satisfies PageServerLoad

export const actions = {
  default: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
    const form = await superValidate(request, zod(mediaArtifactRelationshipTypeSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const id = crypto.randomUUID()

    const result = await locals.di.media().createMediaArtifactRelationshipType({ id, ...form.data })
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
        default: {
          result.error satisfies never
        }
      }
    }

    return { form }
  },
} satisfies Actions
