import { type Actions, error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { isWithinExpirationDate } from 'oslo'
import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { hashPassword, lucia, passwordSchema } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts, passwordResetTokens } from '$lib/server/db/schema'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const verificationToken = params.token

  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)))
  const token = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.tokenHash, tokenHash),
  })

  if (!token || !isWithinExpirationDate(token.expiresAt)) {
    return error(400, 'Invalid or expired token')
  }

  const form = await superValidate(zod(passwordSchema))
  return { form }
}

export const actions: Actions = {
  default: async ({ request, params, cookies, setHeaders }) => {
    const form = await superValidate(request, zod(passwordSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const verificationToken = params.token

    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)))
    const token = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.tokenHash, tokenHash),
    })
    if (token) {
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash))
    }

    if (!token || !isWithinExpirationDate(token.expiresAt)) {
      return error(400, 'Invalid or expired token')
    }

    await lucia.invalidateUserSessions(token.userId)
    await db
      .update(accounts)
      .set({ password: await hashPassword(form.data.password) })
      .where(eq(accounts.id, token.userId))

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
