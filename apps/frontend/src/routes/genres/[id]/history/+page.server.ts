import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { isNotNull } from '$lib/utils/types'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const response = await locals.di.genres().getGenreHistory(id)
  if (response instanceof Error) {
    return error(response.originalError.statusCode, response.message)
  }

  const usersResponse = await locals.di
    .authentication()
    .getAccounts([...new Set(response.history.map((genre) => genre.accountId).filter(isNotNull))])
  const usersMap = usersResponse.match(
    (users) => new Map(users.map((user) => [user.id, user])),
    () => new Map<number, { id: number; username: string }>(),
  )

  return {
    genreHistory: response.history.map((genre) => ({
      ...genre,
      account: genre.accountId !== null ? (usersMap.get(genre.accountId) ?? null) : null,
    })),
  }
}
