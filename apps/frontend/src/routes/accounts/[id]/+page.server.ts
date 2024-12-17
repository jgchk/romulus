import { AuthenticationClientError } from '@romulus/authentication'
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

  const getAccountResponse = await locals.di.authentication().getAccount({ accountId: id })
  if (getAccountResponse instanceof AuthenticationClientError) {
    return error(
      getAccountResponse.originalError.statusCode,
      getAccountResponse.originalError.message,
    )
  }

  const response = await locals.di.genres().queries().getGenreHistoryByAccount(id)
  if (response instanceof Error) {
    return error(response.originalError.statusCode, response.message)
  }
  const history = response.history

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

  return {
    account: { username: getAccountResponse.account.username },
    numCreated,
    numUpdated,
    numDeleted,
    history,
    sort,
    order,
    page,
    limit,
  }
}

export const actions: Actions = {
  createPasswordResetLink: async ({ params, locals }) => {
    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const response = await locals.di.authentication().requestPasswordReset({ accountId: id })
    if (response instanceof AuthenticationClientError) {
      return error(response.originalError.statusCode, {
        message: response.message,
      })
    }

    return { verificationLink: response.passwordResetLink }
  },
}
