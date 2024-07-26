import { type Actions, error, redirect } from '@sveltejs/kit'
import { isWithinExpirationDate } from 'oslo'
import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { hashPassword, lucia, passwordSchema } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const verificationToken = params.token

  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)))
  const token = await db.passwordResetTokens.findByTokenHash(tokenHash)

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
    const token = await db.passwordResetTokens.findByTokenHash(tokenHash)
    if (token) {
      await db.passwordResetTokens.deleteByTokenHash(tokenHash)
    }

    if (!token || !isWithinExpirationDate(token.expiresAt)) {
      return error(400, 'Invalid or expired token')
    }

    await lucia.invalidateUserSessions(token.userId)

    const accountsDb = new AccountsDatabase(locals.dbConnection)
    await accountsDb.update(token.userId, { password: await hashPassword(form.data.password) })

    const session = await lucia.createSession(token.userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })

    setHeaders({ 'Referrer-Policy': 'strict-origin' })
    redirect(302, '/genres')
  },
}
