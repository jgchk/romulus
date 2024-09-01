import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid account ID' })
  }
  const id = maybeId.data

  const accountsDb = new AccountsDatabase()
  const maybeAccount = await accountsDb.findById(id, locals.dbConnection)

  if (!maybeAccount) {
    return error(404, 'Account not found')
  }

  const account = maybeAccount

  const genreHistoryDb = new GenreHistoryDatabase()
  const history = await genreHistoryDb.findByAccountId(id, locals.dbConnection)

  const numCreated = new Set(
    history.filter((h) => h.operation === 'CREATE').map((h) => h.treeGenreId),
  ).size
  const numUpdated = new Set(
    history.filter((h) => h.operation === 'UPDATE').map((h) => h.treeGenreId),
  ).size
  const numDeleted = new Set(
    history.filter((h) => h.operation === 'DELETE').map((h) => h.treeGenreId),
  ).size

  return { account, numCreated, numUpdated, numDeleted, history }
}

export const actions: Actions = {
  createPasswordResetLink: async ({ params, locals }) => {
    // mocha
    if (locals.user?.id !== 1) {
      return error(401, 'Unauthorized')
    }

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const verificationToken = await locals.services.authentication.requestPasswordReset(id)
    const verificationLink = 'https://www.romulus.lol/reset-password/' + verificationToken

    return { verificationLink }
  },
}
