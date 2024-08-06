import { error, fail } from '@sveltejs/kit'
import { pick } from 'ramda'
import { z } from 'zod'

import { generateApiKey, hashApiKey } from '$lib/server/api-keys'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { ApiKeysDatabase } from '$lib/server/db/controllers/api-keys'

import type { Actions, PageServerLoad, PageServerLoadEvent, RequestEvent } from './$types'

export const load = (async ({
  params,
  locals,
}: {
  params: PageServerLoadEvent['params']
  locals: {
    dbConnection: App.Locals['dbConnection']
    user: Pick<NonNullable<App.Locals['user']>, 'id'> | undefined
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
    return error(401, 'Unauthorized')
  }

  const accountsDb = new AccountsDatabase()
  const maybeAccount = await accountsDb.findById(id, locals.dbConnection)
  if (!maybeAccount) {
    return error(404, 'Account not found')
  }
  const account = maybeAccount

  const apiKeysDb = new ApiKeysDatabase()
  const keys = await apiKeysDb.findByAccountId(account.id, locals.dbConnection)

  return { keys: keys.map((key) => pick(['id', 'name', 'createdAt'], key)) }
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
      return error(401, 'Unauthorized')
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
        errors: { name: maybeName.error.errors.map((err) => err.message) },
      })
    }
    const name = maybeName.data

    const key = generateApiKey()
    const keyHash = await hashApiKey(key)

    const apiKeysDb = new ApiKeysDatabase()
    const [insertedKey] = await apiKeysDb.insert(
      [{ accountId: account.id, name, keyHash }],
      locals.dbConnection,
    )

    return { success: true, id: insertedKey.id, name, key }
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

    const maybeApiKeyId = z.coerce.number().safeParse(data.get('id'))
    if (!maybeApiKeyId.success) {
      return fail(400, {
        errors: { id: maybeApiKeyId.error.errors.map((err) => err.message) },
      })
    }
    const apiKeyId = maybeApiKeyId.data

    const apiKeysDb = new ApiKeysDatabase()
    const accountApiKeys = await apiKeysDb.findByAccountId(accountId, locals.dbConnection)
    const isOwnApiKey = accountApiKeys.some((key) => key.id === apiKeyId)
    if (!isOwnApiKey) {
      return error(401, 'Unauthorized')
    }

    await apiKeysDb.deleteById(apiKeyId, locals.dbConnection)
  },
} satisfies Actions
