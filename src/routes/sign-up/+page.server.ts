import { type Actions, redirect } from '@sveltejs/kit'
import Postgres from 'postgres'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { hashPassword, lucia, passwordSchema } from '$lib/server/auth'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'

import type { PageServerLoad } from './$types'

const schema = z.object({ username: z.string().min(3).max(72), password: passwordSchema })

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.session) {
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

    let account
    try {
      const accountsDb = new AccountsDatabase(locals.dbConnection)
      ;[account] = await accountsDb.insert({
        username: form.data.username,
        password: await hashPassword(form.data.password.password),
      })
    } catch (error) {
      if (
        error instanceof Postgres.PostgresError &&
        error.code === '23505' &&
        error.constraint_name === 'Account_username_unique'
      ) {
        return setError(form, 'username', 'Username is already taken')
      }
      throw error
    }

    const session = await lucia.createSession(account.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })

    redirect(302, '/genres')
  },
}
