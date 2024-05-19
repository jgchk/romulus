import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { db } from '$lib/server/db'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const maybeAccount = await db.query.accounts.findFirst({
    where: (accounts, { eq }) => eq(accounts.id, id),
  })

  if (!maybeAccount) {
    return error(404, 'Account not found')
  }

  const account = maybeAccount

  const history = await db.query.genreHistory.findMany({
    where: (genreHistory, { eq }) => eq(genreHistory.accountId, id),
    columns: {
      id: true,
      name: true,
      type: true,
      subtitle: true,
      operation: true,
      createdAt: true,
      treeGenreId: true,
    },
  })

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
