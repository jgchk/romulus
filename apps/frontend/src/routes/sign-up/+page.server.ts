import { AuthenticationClientError, FetchError } from '@romulus/authentication/client'
import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, superValidate } from 'sveltekit-superforms'
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

    const response = await locals.di
      .authentication()
      .register({ username: form.data.username, password: form.data.password.password })
    if (response.isErr()) {
      if (response.error instanceof FetchError) {
        return error(500, `Failed to sign up: ${response.error.message}`)
      } else if (response.error instanceof AuthenticationClientError) {
        return error(response.error.originalError.statusCode, response.error.originalError.message)
      } else {
        response.error satisfies never
        return error(500, 'An unknown error occurred')
      }
    }

    setSessionCookie(
      { token: response.value.token, expires: new Date(response.value.expiresAt) },
      cookies,
    )

    redirect(302, '/genres')
  },
}
