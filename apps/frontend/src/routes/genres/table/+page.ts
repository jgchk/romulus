// params
// - page: number
// - limit: number
// - sort: string
// - order: string

import { getIntParam, getStringParam } from '$lib/utils/params'

import { type PageLoad } from './$types'

const SORT_OPTIONS = ['name', 'type', 'relevance', 'updated'] as const
const ORDER_OPTIONS = ['asc', 'desc'] as const

type SortOption = (typeof SORT_OPTIONS)[number]
type OrderOption = (typeof ORDER_OPTIONS)[number]

const isSortOption = (t: string): t is SortOption => (SORT_OPTIONS as readonly string[]).includes(t)
const isOrderOption = (t: string): t is OrderOption =>
  (ORDER_OPTIONS as readonly string[]).includes(t)

export const load: PageLoad = ({ url }) => {
  const page = getIntParam(url, 'page') ?? 1
  const limit = getIntParam(url, 'limit') ?? 30

  const maybeSort = getStringParam(url, 'sort')
  const sort = maybeSort && isSortOption(maybeSort) ? maybeSort : 'name'

  const maybeOrder = getStringParam(url, 'order')
  const order = maybeOrder && isOrderOption(maybeOrder) ? maybeOrder : 'asc'

  return { page, limit, sort, order }
}
