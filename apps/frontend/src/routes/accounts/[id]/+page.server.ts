import { AuthenticationClientError, FetchError } from '@romulus/authentication/client'
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
  if (getAccountResponse.isErr()) {
    if (getAccountResponse.error instanceof FetchError) {
      return error(500, `Failed to fetch account: ${getAccountResponse.error.message}`)
    } else if (getAccountResponse.error instanceof AuthenticationClientError) {
      return error(
        getAccountResponse.error.originalError.statusCode,
        getAccountResponse.error.originalError.message,
      )
    } else {
      getAccountResponse.error satisfies never
      return error(500, 'An unknown error occurred')
    }
  }

  const response = await locals.di.genres().getGenreHistoryByAccount(id)
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
    account: { username: getAccountResponse.value.username },
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
    if (response.isErr()) {
      if (response.error instanceof FetchError) {
        return error(500, `Failed to fetch account: ${response.error.message}`)
      } else if (response.error instanceof AuthenticationClientError) {
        return error(response.error.originalError.statusCode, response.error.originalError.message)
      } else {
        response.error satisfies never
        return error(500, 'An unknown error occurred')
      }
    }

    return { verificationLink: response.value.passwordResetLink }
  },
}
