import { type Actions, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { NonUniqueUsernameError } from '$lib/server/features/authentication/application/errors/non-unique-username'
import { passwordSchema } from '$lib/server/features/authentication/presentation/schemas/password'

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

    const maybeSessionCookie = await locals.services.authentication.register(
      form.data.username,
      form.data.password.password,
    )
    if (maybeSessionCookie instanceof NonUniqueUsernameError) {
      return setError(form, 'username', 'Username is already taken')
    }
    const sessionCookie = maybeSessionCookie

    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })

    redirect(302, '/genres')
  },
}
