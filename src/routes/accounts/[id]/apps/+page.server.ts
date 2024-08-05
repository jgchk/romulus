import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'

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
  // const account = maybeAccount

  return { keys: [] }
}) satisfies PageServerLoad
