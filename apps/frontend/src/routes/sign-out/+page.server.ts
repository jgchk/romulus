import { type Actions, redirect } from '@sveltejs/kit'

import { deleteSessionCookie } from '$lib/cookie'

export const actions: Actions = {
  default: async ({ locals, cookies }) => {
    await locals.di.authentication().logout()

    deleteSessionCookie(cookies)

    redirect(302, '/sign-in')
  },
}
