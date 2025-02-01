import { error } from '@sveltejs/kit'

import { ifDefined, isNotNull } from '$lib/utils/types'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const response = await locals.di.genres().getLatestGenreUpdates()
  if (response.isErr()) {
    return error(500, response.error.message)
  }

  const usersResponse = await locals.di
    .authentication()
    .getAccounts([
      ...new Set(
        response.value.latestUpdates.map((update) => update.genre.accountId).filter(isNotNull),
      ),
    ])
  const usersMap = usersResponse.match(
    ({ accounts }) => new Map(accounts.map((user) => [user.id, user])),
    () => new Map<number, { id: number; username: string }>(),
  )

  const genreHistory = response.value.latestUpdates.map((h) => ({
    ...h,
    genre: {
      ...h.genre,
      akas: [...h.genre.akas.primary, ...h.genre.akas.secondary, ...h.genre.akas.tertiary],
      account: h.genre.accountId !== null ? (usersMap.get(h.genre.accountId) ?? null) : null,
    },
    previousHistory: ifDefined(h.previousHistory, (ph) => ({
      ...ph,
      akas: [...ph.akas.primary, ...ph.akas.secondary, ...ph.akas.tertiary],
    })),
  }))

  return { genreHistory }
}
