import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { createPasswordResetToken } from '$lib/server/auth'
import { db } from '$lib/server/db'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const maybeAccount = await db.accounts.findById(id)

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

    const verificationToken = await createPasswordResetToken(id)
    const verificationLink = 'https://www.romulus.lol/reset-password/' + verificationToken

    return { verificationLink }
  },
}
