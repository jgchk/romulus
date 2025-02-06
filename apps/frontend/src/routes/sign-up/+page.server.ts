import { FetchError } from '@romulus/authentication/client'
import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, superValidate, setError } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { setSessionCookie } from '$lib/cookie'

import type { PageServerLoad } from './$types'
import { signUpSchema } from './common'

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    return redirect(302, '/')
  }

  const form = await superValidate(zod(signUpSchema))
  return { form }
}

export const actions: Actions = {
  default: async ({ request, cookies, locals }) => {
    const form = await superValidate(request, zod(signUpSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const response = await locals.di
      .authentication()
      .register({ username: form.data.username, password: form.data.password.password })
    if (response.isErr()) {
      switch (response.error.name) {
        case 'FetchError': {
          return error(500, `Failed to sign up: ${response.error.message}`)
        }
        case 'ValidationError': {
          for (const issue of response.error.details.issues) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError(form, issue.path as any, issue.message)
          }
          return fail(400, { form })
        }
        case 'NonUniqueUsernameError': {
          return setError(form, 'username', response.error.message)
        }
        default: {
          response.error satisfies never
          return error(500, 'An unknown error occurred')
        }
      }
    }

    setSessionCookie(
      { token: response.value.token, expires: new Date(response.value.expiresAt) },
      cookies,
    )

    redirect(302, '/genres')
  },
}
