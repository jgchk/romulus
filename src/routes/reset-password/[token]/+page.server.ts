import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { passwordSchema } from '$lib/server/auth'
import {
  AccountNotFoundError,
  ExpiredPasswordResetTokenError,
  PasswordResetTokenNotFoundError,
} from '$lib/server/ddd/features/auth/application/auth-service'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeToken = await locals.services.authService.checkPasswordResetToken(params.token)
  if (
    maybeToken instanceof PasswordResetTokenNotFoundError ||
    maybeToken instanceof ExpiredPasswordResetTokenError
  ) {
    // Don't indicate whether the token is invalid or expired for security
    return error(400, 'Invalid or expired token')
  }

  const form = await superValidate(zod(passwordSchema))
  return { form }
}

export const actions: Actions = {
  default: async ({ request, params, cookies, locals, setHeaders }) => {
    const form = await superValidate(request, zod(passwordSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const verificationToken = params.token
    if (verificationToken === undefined) {
      return error(400, 'Password reset token is required')
    }

    const maybeToken = await locals.services.authService.checkPasswordResetToken(verificationToken)
    if (
      maybeToken instanceof PasswordResetTokenNotFoundError ||
      maybeToken instanceof ExpiredPasswordResetTokenError
    ) {
      // Don't indicate whether the token is invalid or expired for security
      return error(400, 'Invalid or expired token')
    }
    const token = maybeToken

    const maybeSessionCookie = await locals.services.authService.resetPassword(
      token,
      form.data.password,
    )
    if (maybeSessionCookie instanceof AccountNotFoundError) {
      return error(400, 'No account found for token')
    }
    const sessionCookie = maybeSessionCookie

    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })

    setHeaders({ 'Referrer-Policy': 'strict-origin' })
    redirect(302, '/genres')
  },
}
