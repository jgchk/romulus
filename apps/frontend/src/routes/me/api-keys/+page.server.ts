import { type AuthenticationClient } from '@romulus/authentication/client'
import { FetchError } from '@romulus/authentication/client'
import { error, fail } from '@sveltejs/kit'
import { z } from 'zod'

import { type Actions, type PageServerLoad, type RequestEvent } from './$types'

export const load = (async ({
  locals,
}: {
  locals: {
    user: object | undefined
    di: {
      authentication: () => {
        getApiKeys: AuthenticationClient['getApiKeys']
      }
    }
  }
}) => {
  if (locals.user === undefined) {
    return error(401, 'Unauthorized')
  }

  const result = await locals.di.authentication().getApiKeys()
  if (result.isErr()) {
    switch (result.error.name) {
      case 'FetchError': {
        return error(500, result.error.message)
      }
      case 'ValidationError': {
        return error(400, result.error.message)
      }
      case 'UnauthorizedError': {
        return error(401, result.error.message)
      }
      default: {
        result.error satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  }

  return { keys: result.value.keys }
}) satisfies PageServerLoad

export const actions = {
  create: async ({
    locals,
    request,
  }: {
    locals: {
      user: object | undefined
      di: {
        authentication: () => {
          createApiKey: AuthenticationClient['createApiKey']
        }
      }
    }
    request: RequestEvent['request']
  }) => {
    if (locals.user === undefined) {
      return error(401, 'Unauthorized')
    }

    const data = await request.formData()

    const maybeName = z.string().min(1, 'Name is required').safeParse(data.get('name'))
    if (!maybeName.success) {
      return fail(400, {
        action: 'create' as const,
        errors: { name: maybeName.error.errors.map((err) => err.message) },
      })
    }
    const name = maybeName.data

    const result = await locals.di.authentication().createApiKey(name)
    if (result.isErr()) {
      switch (result.error.name) {
        case 'FetchError': {
          return error(500, result.error.message)
        }
        case 'ValidationError': {
          return error(400, result.error.message)
        }
        case 'UnauthorizedError': {
          return error(401, result.error.message)
        }
        default: {
          result.error satisfies never
          return error(500, 'An unknown error occurred')
        }
      }
    }

    return {
      success: true,
      id: result.value.id,
      name: result.value.name,
      key: result.value.key,
    }
  },

  delete: async ({
    locals,
    request,
  }: {
    locals: {
      user: Pick<NonNullable<App.Locals['user']>, 'id'> | undefined
      di: {
        authentication: () => {
          deleteApiKey: AuthenticationClient['deleteApiKey']
        }
      }
    }
    request: RequestEvent['request']
  }) => {
    if (locals.user === undefined) {
      return error(401, 'Unauthorized')
    }

    const data = await request.formData()

    const maybeApiKeyId = z.coerce.number().int().safeParse(data.get('id'))
    if (!maybeApiKeyId.success) {
      return fail(400, {
        action: 'delete' as const,
        errors: { id: maybeApiKeyId.error.errors.map((err) => err.message) },
      })
    }
    const apiKeyId = maybeApiKeyId.data

    const result = await locals.di.authentication().deleteApiKey(apiKeyId)
    if (result.isErr()) {
      if (result.error instanceof FetchError) {
        return error(500, result.error.message)
      } else {
        return error(result.error.statusCode, result.error.message)
      }
    }
  },
} satisfies Actions
