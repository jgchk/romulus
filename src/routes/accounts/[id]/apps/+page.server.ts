import { error } from '@sveltejs/kit'
import { z } from 'zod'

import type { PageServerLoad, PageServerLoadEvent } from './$types'

export const load = (({ params }: Pick<PageServerLoadEvent, 'params'>) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, 'Invalid account ID')
  }
  // const id = maybeId.data

  return { keys: [] }
}) satisfies PageServerLoad
