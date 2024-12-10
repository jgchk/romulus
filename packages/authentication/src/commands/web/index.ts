import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { z } from 'zod'

import { CustomError } from '../../shared/domain/errors'
import { AccountNotFoundError } from '../application/errors/account-not-found'
import { InvalidLoginError } from '../application/errors/invalid-login'
import { NonUniqueUsernameError } from '../application/errors/non-unique-username'
import { PasswordResetTokenExpiredError } from '../application/errors/password-reset-token-expired'
import { PasswordResetTokenNotFoundError } from '../application/errors/password-reset-token-not-found'
import { UnauthorizedError } from '../domain/errors/unauthorized'
import type { CommandsCompositionRoot } from './composition-root'
import { setError } from './utils'
import { zodValidator } from './zod-validator'

export type Router = ReturnType<typeof createRouter>

const passwordSchemaa = z.string().min(8).max(72)

export function createRouter(di: CommandsCompositionRoot) {
  const app = new Hono()
    .post(
      '/login',
      zodValidator('json', z.object({ username: z.string(), password: z.string() })),
      async (c) => {
        const body = c.req.valid('json')

        const result = await di.loginCommand().execute(body.username, body.password)
        if (result instanceof InvalidLoginError) {
          return setError(c, result, 401)
        }

        const cookie = di.cookieCreator().create(result.userSession)
        setCookie(c, cookie.name, cookie.value, cookie.attributes)

        return c.json({ success: true })
      },
    )

    .post('/logout', async (c) => {
      const sessionToken = getCookie(c, di.sessionCookieName)
      if (sessionToken === undefined) {
        return c.json({ success: true })
      }

      await di.logoutCommand().execute(sessionToken)

      deleteCookie(c, di.sessionCookieName)

      return c.json({ success: true })
    })

    .post(
      '/register',
      zodValidator(
        'json',
        z.object({ username: z.string().min(3).max(72), password: passwordSchemaa }),
      ),
      async (c) => {
        const body = c.req.valid('json')

        const result = await di.registerCommand().execute(body.username, body.password)
        if (result instanceof NonUniqueUsernameError) {
          return setError(c, result, 409)
        }

        const cookie = di.cookieCreator().create(result.newUserSession)
        setCookie(c, cookie.name, cookie.value, cookie.attributes)

        return c.json({ success: true })
      },
    )

    .post(
      '/request-password-reset/:accountId',
      zodValidator('param', z.object({ accountId: z.coerce.number().int() })),
      async (c) => {
        const { accountId } = c.req.valid('param')
        const sessionToken = getCookie(c, di.sessionCookieName)
        if (sessionToken === undefined) {
          return setError(c, new UnauthorizedError(), 401)
        }

        const { account } = await di.getSessionCommand().execute(sessionToken)
        if (!account) {
          return setError(c, new UnauthorizedError(), 401)
        }

        const passwordResetToken = await di
          .requestPasswordResetCommand()
          .execute(account, accountId)
        if (passwordResetToken instanceof UnauthorizedError) {
          return setError(c, passwordResetToken, 401)
        } else if (passwordResetToken instanceof AccountNotFoundError) {
          return setError(c, passwordResetToken, 404)
        }

        // FIXME: We probably shouldn't be hardcoding this
        const passwordResetLink = 'https://www.romulus.lol/reset-password/' + passwordResetToken
        return c.json({ passwordResetLink })
      },
    )

    .post(
      '/reset-password/:token',
      zodValidator('json', z.object({ password: passwordSchemaa })),
      async (c) => {
        const body = c.req.valid('json')
        const passwordResetToken = c.req.param('token')

        const result = await di.resetPasswordCommand().execute(passwordResetToken, body.password)
        if (
          result instanceof PasswordResetTokenNotFoundError ||
          result instanceof PasswordResetTokenExpiredError
        ) {
          return setError(c, new InvalidPasswordResetTokenError(), 400)
        } else if (result instanceof AccountNotFoundError) {
          return setError(c, result, 404)
        }

        const cookie = di.cookieCreator().create(result.userSession)
        setCookie(c, cookie.name, cookie.value, cookie.attributes)

        return c.json({ success: true })
      },
    )

    .get('/whoami', async (c) => {
      const sessionToken = getCookie(c, di.sessionCookieName)
      if (sessionToken === undefined) {
        return c.json({ account: null, session: null })
      }

      const result = await di.getSessionCommand().execute(sessionToken)

      return c.json(result)
    })

    .post('/refresh-session', async (c) => {
      const sessionToken = getCookie(c, di.sessionCookieName)
      if (sessionToken === undefined) {
        return setError(c, new UnauthorizedError(), 401)
      }

      const result = await di.refreshSessionCommand().execute(sessionToken)
      if (result instanceof UnauthorizedError) {
        deleteCookie(c, di.sessionCookieName)
        return setError(c, new UnauthorizedError(), 401)
      }

      const cookie = di.cookieCreator().create(result)
      setCookie(c, cookie.name, cookie.value, cookie.attributes)

      return c.json({ success: true })
    })

  return app
}

class InvalidPasswordResetTokenError extends CustomError {
  constructor() {
    super('InvalidPasswordResetTokenError', 'Invalid password reset token')
  }
}
