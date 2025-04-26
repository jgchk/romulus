import type { AuthenticationClient } from '@romulus/authentication/client'
import type { Cookies } from '@sveltejs/kit'
import { error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { setSessionCookie } from '$lib/cookie'

import type { Actions, PageServerLoad } from './$types'
import { signInSchema } from './common'

export const load = (async ({ locals }: { locals: { user: object | undefined } }) => {
  if (locals.user) {
    return redirect(302, '/')
  }

  const form = await superValidate(zod(signInSchema))
  return { form }
}) satisfies PageServerLoad

export const actions = {
  default: async ({
    request,
    cookies,
    locals,
  }: {
    request: Request
    cookies: Pick<Cookies, 'set'>
    locals: { di: { authentication: () => { login: AuthenticationClient['login'] } } }
  }) => {
    const form = await superValidate(request, zod(signInSchema), { strict: true })

    if (!form.valid) {
      return fail(400, { form })
    }

    const response = await locals.di
      .authentication()
      .login({ username: form.data.username, password: form.data.password })
    if (response.isErr()) {
      switch (response.error.name) {
        case 'FetchError': {
          return error(500, response.error.message)
        }
        case 'ValidationError': {
          for (const issue of response.error.details.issues) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError(form, issue.path as any, issue.message)
          }
          return fail(400, { form })
        }
        case 'InvalidLoginError': {
          return error(401, response.error.message)
        }
      }
    }

    setSessionCookie(
      { token: response.value.token, expires: new Date(response.value.expiresAt) },
      cookies,
    )

    redirect(302, '/genres')
  },
} satisfies Actions
