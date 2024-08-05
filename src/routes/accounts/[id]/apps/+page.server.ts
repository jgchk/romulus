import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'

import type { PageServerLoad, PageServerLoadEvent } from './$types'

export const load = (async ({
  params,
  locals,
}: {
  params: PageServerLoadEvent['params']
  locals: Pick<App.Locals, 'dbConnection'>
}) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, 'Invalid account ID')
  }
  const id = maybeId.data

  const accountsDb = new AccountsDatabase()
  const maybeAccount = await accountsDb.findById(id, locals.dbConnection)
  if (!maybeAccount) {
    return error(404, 'Account not found')
  }
  // const account = maybeAccount

  return { keys: [] }
}) satisfies PageServerLoad
