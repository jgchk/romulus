import { type Actions, error, redirect } from '@sveltejs/kit'
import { isWithinExpirationDate } from 'oslo'
import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { hashPassword, passwordSchema } from '$lib/server/auth'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { PasswordResetTokensDatabase } from '$lib/server/db/controllers/password-reset-tokens'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const verificationToken = params.token
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)))

  const passwordResetTokensDb = new PasswordResetTokensDatabase()
  const token = await passwordResetTokensDb.findByTokenHash(tokenHash, locals.dbConnection)

  if (!token || !isWithinExpirationDate(token.expiresAt)) {
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
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)))

    const passwordResetTokensDb = new PasswordResetTokensDatabase()
    const token = await passwordResetTokensDb.findByTokenHash(tokenHash, locals.dbConnection)
    if (token) {
      await passwordResetTokensDb.deleteByTokenHash(tokenHash, locals.dbConnection)
    }

    if (!token || !isWithinExpirationDate(token.expiresAt)) {
      return error(400, 'Invalid or expired token')
    }

    await locals.lucia.invalidateUserSessions(token.userId)

    const accountsDb = new AccountsDatabase()
    await accountsDb.update(
      token.userId,
      { password: await hashPassword(form.data.password) },
      locals.dbConnection,
    )

    const session = await locals.lucia.createSession(token.userId, {})
    const sessionCookie = locals.lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })

    setHeaders({ 'Referrer-Policy': 'strict-origin' })
    redirect(302, '/genres')
  },
}
