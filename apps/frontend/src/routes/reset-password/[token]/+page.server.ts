import { AuthenticationClientError } from '@romulus/authentication'
import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { setSessionCookie } from '$lib/cookie'

import type { PageServerLoad } from './$types'

const schema = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      return ctx.addIssue({
        path: ['confirmPassword'],
        message: 'Passwords do not match',
        code: 'custom',
      })
    }
  })

export const load: PageServerLoad = async () => {
  const form = await superValidate(zod(schema))
  return { form }
}

export const actions: Actions = {
  default: async ({ request, params, cookies, locals, setHeaders }) => {
    const form = await superValidate(request, zod(schema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const verificationToken = params.token
    if (verificationToken === undefined) {
      return error(400, 'Password reset token is required')
    }

    const response = await locals.di
      .authentication()
      .resetPassword({ passwordResetToken: verificationToken, newPassword: form.data.password })
    if (response instanceof AuthenticationClientError) {
      return error(response.originalError.statusCode, response.message)
    }

    setSessionCookie({ token: response.token, expires: new Date(response.expiresAt) }, cookies)

    setHeaders({ 'Referrer-Policy': 'strict-origin' })
    redirect(302, '/genres')
  },
}
