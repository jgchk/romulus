import {
  AuthenticationClientError,
  FetchError,
  type IAuthenticationClient,
} from '@romulus/authentication/client'
import { error, fail } from '@sveltejs/kit'
import { z } from 'zod'

import type { Actions, PageServerLoad, RequestEvent } from './$types'

export const load = (async ({
  locals,
}: {
  locals: {
    user: Pick<NonNullable<App.Locals['user']>, 'id'> | undefined
    di: {
      authentication: () => {
        getApiKeys: IAuthenticationClient['getApiKeys']
      }
    }
  }
}) => {
  const result = await locals.di.authentication().getApiKeys()
  if (result.isErr()) {
    if (result.error instanceof FetchError) {
      return error(500, result.error.message)
    } else if (result.error instanceof AuthenticationClientError) {
      return error(result.error.originalError.statusCode, result.error.message)
    } else {
      result.error satisfies never
      return error(500, 'An unknown error occurred')
    }
  }

  return { keys: result.value }
}) satisfies PageServerLoad

export const actions = {
  create: async ({
    locals,
    request,
  }: {
    locals: {
      user: Pick<NonNullable<App.Locals['user']>, 'id'> | undefined
      di: {
        authentication: () => {
          createApiKey: IAuthenticationClient['createApiKey']
        }
      }
    }
    request: RequestEvent['request']
  }) => {
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
      if (result.error instanceof FetchError) {
        return error(500, result.error.message)
      } else if (result.error instanceof AuthenticationClientError) {
        return error(result.error.originalError.statusCode, result.error.message)
      } else {
        result.error satisfies never
        return error(500, 'An unknown error occurred')
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
          deleteApiKey: IAuthenticationClient['deleteApiKey']
        }
      }
    }
    request: RequestEvent['request']
  }) => {
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
      } else if (result.error instanceof AuthenticationClientError) {
        return error(result.error.originalError.statusCode, result.error.message)
      } else {
        result.error satisfies never
        return error(500, 'An unknown error occurred')
      }
    }
  },
} satisfies Actions
