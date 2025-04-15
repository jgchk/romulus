import { redirect } from '@sveltejs/kit'

import { routes } from '$lib/routes'

import type { PageLoad } from './$types'

export const load: PageLoad = () => {
  return redirect(307, routes.media.types.cards.route())
}
