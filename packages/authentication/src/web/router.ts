import { Hono } from 'hono'
import { z } from 'zod'

import { AccountNotFoundError } from '../application/errors/account-not-found'
import { InvalidLoginError } from '../application/errors/invalid-login'
import { NonUniqueUsernameError } from '../application/errors/non-unique-username'
import { PasswordResetTokenExpiredError } from '../application/errors/password-reset-token-expired'
import { PasswordResetTokenNotFoundError } from '../application/errors/password-reset-token-not-found'
import { CustomError } from '../domain/errors/base'
import { UnauthorizedError } from '../domain/errors/unauthorized'
import { bearerAuth } from './bearer-auth-middleware'
import type { CommandsCompositionRoot } from './composition-root'
import { setError } from './utils'
import { zodValidator } from './zod-validator'

export type Router = ReturnType<typeof createRouter>

const passwordSchema = z.string().min(8).max(72)

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

        return c.json({
          success: true,
          token: result.userSession.token,
          expiresAt: result.userSession.expiresAt,
        } as const)
      },
    )

    .post('/logout', bearerAuth, async (c) => {
      const sessionToken = c.var.token

      await di.logoutCommand().execute(sessionToken)

      return c.json({ success: true } as const)
    })

    .post(
      '/register',
      zodValidator(
        'json',
        z.object({ username: z.string().min(3).max(72), password: passwordSchema }),
      ),
      async (c) => {
        const body = c.req.valid('json')

        const result = await di.registerCommand().execute(body.username, body.password)
        if (result instanceof NonUniqueUsernameError) {
          return setError(c, result, 409)
        }

        return c.json({
          success: true,
          token: result.newUserSession.token,
          expiresAt: result.newUserSession.expiresAt,
        } as const)
      },
    )

    .post(
      '/request-password-reset/:accountId',
      zodValidator('param', z.object({ accountId: z.coerce.number().int() })),
      bearerAuth,
      async (c) => {
        const sessionToken = c.var.token

        const { accountId } = c.req.valid('param')

        const requestorSession = await di.getSessionCommand().execute(sessionToken)
        if (requestorSession instanceof UnauthorizedError) {
          return setError(c, requestorSession, 401)
        }

        const passwordResetToken = await di
          .requestPasswordResetCommand()
          .execute(requestorSession.account.id, accountId)
        if (passwordResetToken instanceof UnauthorizedError) {
          return setError(c, passwordResetToken, 401)
        } else if (passwordResetToken instanceof AccountNotFoundError) {
          return setError(c, passwordResetToken, 404)
        }

        // FIXME: We probably shouldn't be hardcoding this
        const passwordResetLink = 'https://www.romulus.lol/reset-password/' + passwordResetToken
        return c.json({ success: true, passwordResetLink } as const)
      },
    )

    .post(
      '/reset-password/:token',
      zodValidator('json', z.object({ password: passwordSchema })),
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

        return c.json({
          success: true,
          token: result.userSession.token,
          expiresAt: result.userSession.expiresAt,
        } as const)
      },
    )

    .get('/whoami', bearerAuth, async (c) => {
      const sessionToken = c.var.token

      const result = await di.getSessionCommand().execute(sessionToken)
      if (result instanceof UnauthorizedError) {
        return setError(c, result, 401)
      }

      return c.json({ success: true, ...result } as const)
    })

    .get(
      '/account/:id',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      bearerAuth,
      async (c) => {
        const sessionToken = c.var.token

        const requestorSession = await di.getSessionCommand().execute(sessionToken)
        if (requestorSession instanceof UnauthorizedError) {
          return setError(c, requestorSession, 401)
        }

        const { id } = c.req.valid('param')

        const result = await di.getAccountCommand().execute(requestorSession.account.id, id)
        if (result instanceof UnauthorizedError) {
          return setError(c, result, 401)
        } else if (result instanceof AccountNotFoundError) {
          return setError(c, result, 404)
        }

        return c.json({ success: true, account: result } as const)
      },
    )

    .post('/refresh-session', bearerAuth, async (c) => {
      const sessionToken = c.var.token

      const result = await di.refreshSessionCommand().execute(sessionToken)
      if (result instanceof UnauthorizedError) {
        return setError(c, result, 401)
      }

      return c.json({ success: true, token: result.token, expiresAt: result.expiresAt } as const)
    })

  return app
}

class InvalidPasswordResetTokenError extends CustomError {
  constructor() {
    super('InvalidPasswordResetTokenError', 'Invalid password reset token')
  }
}
