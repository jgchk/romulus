import { error } from '@sveltejs/kit'
import { z } from 'zod'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid release issue ID' })
  }
  const id = maybeId.data

  const { releaseIssue } = await locals.services.musicCatalog.queries.getReleaseIssue(id)

  if (!releaseIssue) {
    return error(404, { message: 'Release issue not found' })
  }

  return { releaseIssue }
}
