import { type Actions, error } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { mediaTypeSchema } from '$lib/features/media/components/MediaTypeForm'

import type { PageServerLoad } from './$types'

export const load = (async ({
  locals,
}: {
  locals: { user?: { permissions: { mediaTypes: { canCreate: boolean } } } }
}) => {
  if (!locals.user?.permissions.mediaTypes.canCreate) {
    return error(403, { message: 'You do not have permission to create media types' })
  }

  const form = await superValidate(zod(mediaTypeSchema), { errors: false })
  return { form }
}) satisfies PageServerLoad

export const actions = {
  default: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
    const form = await superValidate(request, zod(mediaTypeSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const id = crypto.randomUUID()

    const result = await locals.di.media().createMediaType({ id, ...form.data })
    console.log({ result })
    if (result.isErr()) {
      switch (result.error.name) {
        case 'FetchError': {
          return error(500, result.error.message)
        }
        case 'MediaTypeTreeCycleError': {
          return setError(form, 'parents._errors', result.error.message)
        }
        default: {
          result.error satisfies never
        }
      }
    }

    return { form }
  },
} satisfies Actions
