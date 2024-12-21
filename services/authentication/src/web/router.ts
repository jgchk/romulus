import { Hono } from 'hono'
import { z } from 'zod'

import type { CreateApiKeyCommand } from '../application/commands/create-api-key'
import type { DeleteApiKeyCommand } from '../application/commands/delete-api-key'
import { UnauthorizedApiKeyDeletionError } from '../application/commands/delete-api-key'
import type { GetAccountQuery } from '../application/commands/get-account'
import type { GetAccountsQuery } from '../application/commands/get-accounts'
import type { GetApiKeysByAccountQuery } from '../application/commands/get-api-keys-by-account'
import type { LoginCommand } from '../application/commands/login'
import type { LogoutCommand } from '../application/commands/logout'
import type { RefreshSessionCommand } from '../application/commands/refresh-session'
import type { RegisterCommand } from '../application/commands/register'
import type { RequestPasswordResetCommand } from '../application/commands/request-password-reset'
import type { ResetPasswordCommand } from '../application/commands/reset-password'
import type { WhoamiQuery } from '../application/commands/whoami'
import { AccountNotFoundError } from '../application/errors/account-not-found'
import { InvalidLoginError } from '../application/errors/invalid-login'
import { NonUniqueUsernameError } from '../application/errors/non-unique-username'
import { PasswordResetTokenExpiredError } from '../application/errors/password-reset-token-expired'
import { PasswordResetTokenNotFoundError } from '../application/errors/password-reset-token-not-found'
import { CustomError } from '../domain/errors/base'
import { UnauthorizedError } from '../domain/errors/unauthorized'
import { bearerAuth } from './bearer-auth-middleware'
import { setError } from './utils'
import { zodValidator } from './zod-validator'

export type Router = ReturnType<typeof createAuthenticationRouter>

const passwordSchema = z.string().min(8).max(72)

export type AuthorizationRouterDependencies = {
  loginCommand(): LoginCommand
  logoutCommand(): LogoutCommand
  registerCommand(): RegisterCommand
  requestPasswordResetCommand(): RequestPasswordResetCommand
  resetPasswordCommand(): ResetPasswordCommand
  whoamiQuery(): WhoamiQuery
  getAccountQuery(): GetAccountQuery
  getAccountsQuery(): GetAccountsQuery
  refreshSessionCommand(): RefreshSessionCommand
  createApiKeyCommand(): CreateApiKeyCommand
  deleteApiKeyCommand(): DeleteApiKeyCommand
  getApiKeysByAccountQuery(): GetApiKeysByAccountQuery
}

export function createAuthenticationRouter(di: AuthorizationRouterDependencies) {
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

        const whoamiResult = await di.whoamiQuery().execute(sessionToken)
        if (whoamiResult instanceof UnauthorizedError) {
          return setError(c, whoamiResult, 401)
        }

        const passwordResetToken = await di
          .requestPasswordResetCommand()
          .execute(accountId, whoamiResult.account.id)
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

      const result = await di.whoamiQuery().execute(sessionToken)
      if (result instanceof UnauthorizedError) {
        return setError(c, result, 401)
      }

      return c.json({ success: true, ...result } as const)
    })

    .get(
      '/accounts/:id',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const { id } = c.req.valid('param')

        const result = await di.getAccountQuery().execute(id)
        if (result instanceof AccountNotFoundError) {
          return setError(c, result, 404)
        }

        return c.json({ success: true, account: result } as const)
      },
    )

    .get(
      '/accounts',
      zodValidator('query', z.object({ id: z.coerce.number().int().array() })),
      async (c) => {
        const ids = c.req.valid('query').id

        const result = await di.getAccountsQuery().execute(ids)

        return c.json({ success: true, accounts: result } as const)
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

    .post(
      '/me/api-keys',
      bearerAuth,
      zodValidator('json', z.object({ name: z.string().min(1) })),
      async (c) => {
        const name = c.req.valid('json').name
        const sessionToken = c.var.token

        const whoamiResult = await di.whoamiQuery().execute(sessionToken)
        if (whoamiResult instanceof UnauthorizedError) {
          return setError(c, whoamiResult, 401)
        }

        const result = await di.createApiKeyCommand().execute(name, whoamiResult.account.id)

        return c.json({ success: true, id: result.id, name: result.name, key: result.key } as const)
      },
    )

    .delete(
      '/me/api-keys/:id',
      bearerAuth,
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const id = c.req.valid('param').id
        const sessionToken = c.var.token

        const whoamiResult = await di.whoamiQuery().execute(sessionToken)
        if (whoamiResult instanceof UnauthorizedError) {
          return setError(c, whoamiResult, 401)
        }

        const result = await di.deleteApiKeyCommand().execute(id, whoamiResult.account.id)
        if (result instanceof UnauthorizedApiKeyDeletionError) {
          return setError(c, result, 401)
        }

        return c.json({ success: true } as const)
      },
    )

    .get('/me/api-keys', bearerAuth, async (c) => {
      const sessionToken = c.var.token

      const whoamiResult = await di.whoamiQuery().execute(sessionToken)
      if (whoamiResult instanceof UnauthorizedError) {
        return setError(c, whoamiResult, 401)
      }

      const result = await di.getApiKeysByAccountQuery().execute(whoamiResult.account.id)

      return c.json({ success: true, keys: result } as const)
    })

  return app
}

class InvalidPasswordResetTokenError extends CustomError {
  constructor() {
    super('InvalidPasswordResetTokenError', 'Invalid password reset token')
  }
}
