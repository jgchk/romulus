import { error, redirect } from '@sveltejs/kit'

import { routes } from '$lib/routes'

import type { Actions } from './$types'

export const actions = {
  default: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
    const data = await request.formData()
    const id = data.get('id')

    if (id === null) {
      return error(400, { message: 'Missing id' })
    }
    if (id instanceof File) {
      return error(400, { message: 'Invalid id' })
    }

    const result = await locals.di.media().deleteMediaArtifactType(id)
    if (result.isErr()) {
      switch (result.error.name) {
        case 'FetchError': {
          return error(500, result.error.message)
        }
        case 'UnauthenticatedError':
        case 'UnauthorizedError': {
          return error(result.error.statusCode, result.error.message)
        }
        default: {
          result.error satisfies never
        }
      }
    }

    return redirect(303, routes.media.artifactTypes.route())
  },
} satisfies Actions
