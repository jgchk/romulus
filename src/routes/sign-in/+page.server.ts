import { type Actions, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { InvalidLoginError } from '$lib/server/features/authentication/commands/application/errors/invalid-login'

import type { PageServerLoad } from './$types'

const schema = z.object({
  username: z.string(),
  password: z.string(),
})

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    return redirect(302, '/')
  }

  const form = await superValidate(zod(schema))
  return { form }
}

export const actions: Actions = {
  default: async ({ request, cookies, locals }) => {
    const form = await superValidate(request, zod(schema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const maybeSessionCookie = await locals.di
      .authenticationController()
      .login(form.data.username, form.data.password)
    if (maybeSessionCookie instanceof InvalidLoginError) {
      return setError(form, 'Incorrect username or password')
    }
    const sessionCookie = maybeSessionCookie

    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })

    redirect(302, '/genres')
  },
}
