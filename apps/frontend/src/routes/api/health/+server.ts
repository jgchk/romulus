import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET = (() => {
  return json({ success: true })
}) satisfies RequestHandler
