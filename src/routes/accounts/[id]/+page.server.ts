import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { getStringParam } from '$lib/utils/params'

import type { Actions, PageServerLoad } from './$types'

const SORT_OPTIONS = ['genre', 'change', 'date'] as const
const ORDER_OPTIONS = ['asc', 'desc'] as const

type SortOption = (typeof SORT_OPTIONS)[number]
type OrderOption = (typeof ORDER_OPTIONS)[number]

const isSortOption = (t: string): t is SortOption => (SORT_OPTIONS as readonly string[]).includes(t)
const isOrderOption = (t: string): t is OrderOption =>
  (ORDER_OPTIONS as readonly string[]).includes(t)

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid account ID' })
  }
  const id = maybeId.data

  const maybeAccount = await locals.services.authentication.queries.getAccount(id)

  if (!maybeAccount) {
    return error(404, 'Account not found')
  }

  const account = maybeAccount

  const history = await locals.services.genre.queries.getGenreHistoryByAccount(id)

  const numCreated = new Set(
    history.filter((h) => h.operation === 'CREATE').map((h) => h.treeGenreId),
  ).size
  const numUpdated = new Set(
    history.filter((h) => h.operation === 'UPDATE').map((h) => h.treeGenreId),
  ).size
  const numDeleted = new Set(
    history.filter((h) => h.operation === 'DELETE').map((h) => h.treeGenreId),
  ).size

  const maybeSort = getStringParam(url, 'sort')
  const sort = maybeSort && isSortOption(maybeSort) ? maybeSort : 'date'

  const maybeOrder = getStringParam(url, 'order')
  const order = maybeOrder && isOrderOption(maybeOrder) ? maybeOrder : 'desc'

  return { account, numCreated, numUpdated, numDeleted, history, sort, order }
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

    const verificationToken = await locals.services.authentication.commands.requestPasswordReset(id)
    const verificationLink = 'https://www.romulus.lol/reset-password/' + verificationToken

    return { verificationLink }
  },
}
