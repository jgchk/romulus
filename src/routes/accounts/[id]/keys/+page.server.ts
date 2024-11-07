import { error, fail } from '@sveltejs/kit'
import { z } from 'zod'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { UnauthorizedApiKeyDeletionError } from '$lib/server/features/api/commands/application/commands/delete-api-key'

import type { Actions, PageServerLoad, PageServerLoadEvent, RequestEvent } from './$types'

export const load = (async ({
  params,
  locals,
}: {
  params: PageServerLoadEvent['params']
  locals: {
    dbConnection: App.Locals['dbConnection']
    user: Pick<NonNullable<App.Locals['user']>, 'id'> | undefined
    services: {
      api: {
        queries: App.Locals['services']['api']['queries']
      }
    }
  }
}) => {
  if (!locals.user) {
    return error(401, 'Unauthorized')
  }

  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, 'Invalid account ID')
  }
  const id = maybeId.data

  if (locals.user.id !== id) {
    return error(403, 'Unauthorized')
  }

  const accountsDb = new AccountsDatabase()
  const maybeAccount = await accountsDb.findById(id, locals.dbConnection)
  if (!maybeAccount) {
    return error(404, 'Account not found')
  }
  const account = maybeAccount

  const keys = await locals.services.api.queries.getApiKeysByAccount(account.id)

  return { keys }
}) satisfies PageServerLoad

export const actions = {
  create: async ({
    params,
    locals,
    request,
  }: {
    params: RequestEvent['params']
    locals: {
      dbConnection: App.Locals['dbConnection']
      user: Pick<NonNullable<App.Locals['user']>, 'id'> | undefined
      services: {
        api: {
          commands: App.Locals['services']['api']['commands']
        }
      }
    }
    request: RequestEvent['request']
  }) => {
    if (!locals.user) {
      return error(401, 'Unauthorized')
    }

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, 'Invalid account ID')
    }
    const id = maybeId.data

    if (locals.user.id !== id) {
      return error(403, 'Unauthorized')
    }

    const accountsDb = new AccountsDatabase()
    const maybeAccount = await accountsDb.findById(id, locals.dbConnection)
    if (!maybeAccount) {
      return error(404, 'Account not found')
    }
    const account = maybeAccount

    const data = await request.formData()

    const maybeName = z.string().min(1, 'Name is required').safeParse(data.get('name'))
    if (!maybeName.success) {
      return fail(400, {
        action: 'create' as const,
        errors: { name: maybeName.error.errors.map((err) => err.message) },
      })
    }
    const name = maybeName.data

    const insertedKey = await locals.services.api.commands.createApiKey(name, account.id)

    return { success: true, id: insertedKey.id, name: insertedKey.name, key: insertedKey.key }
  },

  delete: async ({
    params,
    locals,
    request,
  }: {
    params: RequestEvent['params']
    locals: {
      dbConnection: App.Locals['dbConnection']
      user: Pick<NonNullable<App.Locals['user']>, 'id'> | undefined
      services: {
        api: {
          commands: App.Locals['services']['api']['commands']
        }
      }
    }
    request: RequestEvent['request']
  }) => {
    if (!locals.user) {
      return error(401, 'Unauthorized')
    }

    const maybeAccountId = z.coerce.number().int().safeParse(params.id)
    if (!maybeAccountId.success) {
      return error(400, 'Invalid account ID')
    }
    const accountId = maybeAccountId.data

    if (locals.user.id !== accountId) {
      return error(401, 'Unauthorized')
    }

    const accountsDb = new AccountsDatabase()
    const maybeAccount = await accountsDb.findById(accountId, locals.dbConnection)
    if (!maybeAccount) {
      return error(404, 'Account not found')
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

    const result = await locals.services.api.commands.deleteApiKey(apiKeyId, accountId)
    if (result instanceof UnauthorizedApiKeyDeletionError) {
      return error(401, 'Unauthorized')
    }
  },
} satisfies Actions
