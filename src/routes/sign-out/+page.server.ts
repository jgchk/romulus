import { type Actions, fail, redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ locals, cookies }) => {
    if (!locals.session) {
      return fail(401)
    }

    const blankSessionCookie = await locals.services.authentication.logout(locals.session.id)

    cookies.set(blankSessionCookie.name, blankSessionCookie.value, {
      path: '.',
      ...blankSessionCookie.attributes,
    })

    redirect(302, '/sign-in')
  },
}
