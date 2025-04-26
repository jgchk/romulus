import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET = (async ({ locals }) => {
  const mediaTypes = await locals.di
    .media()
    .getAllMediaTypes()
    .then((res) => {
      if (res.isErr()) throw res.error
      return res.value.mediaTypes
    })

  return json({ mediaTypes })
}) satisfies RequestHandler
