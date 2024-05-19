import { type Actions, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { checkPassword, hashPassword, lucia } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts } from '$lib/server/db/schema'

import type { PageServerLoad } from './$types'

const schema = z.object({
  username: z.string(),
  password: z.string(),
})

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.session) {
    return redirect(302, '/')
  }

  const form = await superValidate(zod(schema))
  return { form }
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(schema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const account = await db
      .select()
      .from(accounts)
      .where(eq(accounts.username, form.data.username))
      .limit(1)
      .then((res) => res.at(0))

    if (!account) {
      // spend some time to "waste" some time
      // this makes brute forcing harder
      await hashPassword(form.data.password)
      return fail(401, {
        form,
        message: 'Incorrect username or password',
      })
    }

    const validPassword = await checkPassword(form.data.password, account.password)
    if (!validPassword) {
      return fail(401, {
        form,
        message: 'Incorrect username or password',
      })
    }

    const session = await lucia.createSession(account.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })

    redirect(302, '/')
  },
}
