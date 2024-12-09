import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { getIntParam, getStringParam } from '$lib/utils/params'

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

  const maybeAccount = await locals.di.authenticationQueryService().getAccount(id)

  if (!maybeAccount) {
    return error(404, 'Account not found')
  }
  const account = maybeAccount

  const history = await locals.di.genreQueryService().getGenreHistoryByAccount(id)

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

  const page = getIntParam(url, 'page') ?? 1
  const limit = getIntParam(url, 'limit') ?? 30

  return { account, numCreated, numUpdated, numDeleted, history, sort, order, page, limit }
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

    const verificationToken = await locals.di
      .authenticationCommandService()
      .requestPasswordReset(id)
    const verificationLink = 'https://www.romulus.lol/reset-password/' + verificationToken

    return { verificationLink }
  },
}
