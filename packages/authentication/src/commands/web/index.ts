import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { z } from 'zod'

import { CustomError } from '../../shared/domain/errors'
import { AccountNotFoundError } from '../application/errors/account-not-found'
import { InvalidLoginError } from '../application/errors/invalid-login'
import { NonUniqueUsernameError } from '../application/errors/non-unique-username'
import { PasswordResetTokenExpiredError } from '../application/errors/password-reset-token-expired'
import { PasswordResetTokenNotFoundError } from '../application/errors/password-reset-token-not-found'
import { UnauthorizedError } from '../presentation/controllers/request-password-reset'
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

        const sessionCookie = await di.controller().login(body.username, body.password)
        if (sessionCookie instanceof InvalidLoginError) {
          return setError(c, sessionCookie, 401)
        }

        setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

        return c.json({ success: true })
      },
    )

    .post('/logout', async (c) => {
      const sessionToken = getCookie(c, di.sessionCookieName)
      if (sessionToken === undefined) {
        return c.json({ success: true })
      }

      const blankSessionCookie = await di.controller().logout(sessionToken)

      deleteCookie(c, blankSessionCookie.name, blankSessionCookie.attributes)

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

        const sessionCookie = await di.controller().register(body.username, body.password)
        if (sessionCookie instanceof NonUniqueUsernameError) {
          return setError(c, sessionCookie, 409)
        }

        setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

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
          return setError(c, new SessionNotFoundError(), 401)
        }

        const passwordResetLink = await di
          .controller()
          .requestPasswordReset(sessionToken, accountId)
        if (passwordResetLink instanceof UnauthorizedError) {
          return setError(c, passwordResetLink, 401)
        } else if (passwordResetLink instanceof AccountNotFoundError) {
          return setError(c, passwordResetLink, 404)
        }

        return c.json({ passwordResetLink })
      },
    )

    .post(
      '/reset-password/:token',
      zodValidator('json', z.object({ password: passwordSchemaa })),
      async (c) => {
        const body = c.req.valid('json')
        const passwordResetToken = c.req.param('token')

        const sessionCookie = await di.controller().resetPassword(passwordResetToken, body.password)
        if (
          sessionCookie instanceof PasswordResetTokenNotFoundError ||
          sessionCookie instanceof PasswordResetTokenExpiredError
        ) {
          return setError(c, new InvalidPasswordResetTokenError(), 400)
        } else if (sessionCookie instanceof AccountNotFoundError) {
          return setError(c, sessionCookie, 404)
        }

        setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

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

    .post('/session/refresh', async (c) => {
      const sessionToken = getCookie(c, di.sessionCookieName)
      if (sessionToken === undefined) {
        return setError(c, new SessionNotFoundError(), 401)
      }

      const { account, cookie } = await di.controller().validateSession(sessionToken)

      if (cookie) {
        setCookie(c, cookie.name, cookie.value, cookie.attributes)
      }

      return c.json({ success: true, account })
    })

  return app
}

class InvalidPasswordResetTokenError extends CustomError {
  constructor() {
    super('InvalidPasswordResetTokenError', 'Invalid password reset token')
  }
}

class SessionNotFoundError extends CustomError {
  constructor() {
    super('SessionNotFoundError', 'No session found')
  }
}
