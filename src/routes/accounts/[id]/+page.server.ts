import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { createPasswordResetToken } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { PasswordResetTokensDatabase } from '$lib/server/db/controllers/password-reset-tokens'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const accountsDb = new AccountsDatabase(locals.dbConnection)
  const maybeAccount = await accountsDb.findById(id)

  if (!maybeAccount) {
    return error(404, 'Account not found')
  }

  const account = maybeAccount

  const history = await db.genreHistory.findByAccountId(id)

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

    const passwordResetTokensDb = new PasswordResetTokensDatabase(locals.dbConnection)
    const verificationToken = await createPasswordResetToken(id, passwordResetTokensDb)
    const verificationLink = 'https://www.romulus.lol/reset-password/' + verificationToken

    return { verificationLink }
  },
}
