import { type Actions, fail, redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ locals, cookies }) => {
    if (!locals.session) {
      return fail(401)
    }
    await locals.lucia.invalidateSession(locals.session.id)
    const sessionCookie = locals.lucia.createBlankSessionCookie()
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })
    redirect(302, '/sign-in')
  },
}
