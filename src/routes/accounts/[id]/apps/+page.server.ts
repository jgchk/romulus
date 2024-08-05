import { error } from '@sveltejs/kit'
import { pick } from 'ramda'
import { z } from 'zod'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { ApiKeysDatabase } from '$lib/server/db/controllers/api-keys'

import type { PageServerLoad, PageServerLoadEvent } from './$types'

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

  return { keys: keys.map((key) => pick(['name', 'createdAt'], key)) }
}) satisfies PageServerLoad