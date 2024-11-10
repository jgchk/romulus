import { type Actions, fail, redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ locals, cookies }) => {
    if (!locals.sessionToken) {
      return fail(401)
    }

    const blankSessionCookie = await locals.controllers.authentication.logout(locals.sessionToken)

    cookies.set(blankSessionCookie.name, blankSessionCookie.value, {
      path: '.',
      ...blankSessionCookie.attributes,
    })

    redirect(302, '/sign-in')
  },
}
