import { AuthenticationClientError } from '@romulus/authentication'
import { type Actions, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { setSessionCookie } from '$lib/cookie'

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

    const response = await locals.di
      .authentication()
      .login({ username: form.data.username, password: form.data.password })
    if (response instanceof AuthenticationClientError) {
      return setError(form, 'Incorrect username or password')
    }

    setSessionCookie({ token: response.token, expires: new Date(response.expiresAt) }, cookies)

    redirect(302, '/genres')
  },
}
