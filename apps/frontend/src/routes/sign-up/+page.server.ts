import { AuthenticationClientError } from '@romulus/authentication'
import { type Actions, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { setSessionCookie } from '$lib/cookie'

import type { PageServerLoad } from './$types'

const schema = z
  .object({
    username: z.string(),
    password: z.object({
      password: z.string(),
      confirmPassword: z.string(),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password.password !== data.password.confirmPassword) {
      return ctx.addIssue({
        path: ['password', 'confirmPassword'],
        message: 'Passwords do not match',
        code: 'custom',
      })
    }
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

    const registerResult = await locals.di
      .authentication()
      .register({ username: form.data.username, password: form.data.password.password })
    if (registerResult instanceof AuthenticationClientError) {
      return setError(form, 'username', 'Username is already taken')
    }

    setSessionCookie(
      { token: registerResult.token, expires: new Date(registerResult.expiresAt) },
      cookies,
    )

    redirect(302, '/genres')
  },
}
