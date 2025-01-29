import { OpenAPIHono } from '@hono/zod-openapi'

import type { CreateApiKeyCommand } from '../application/commands/create-api-key.js'
import type { DeleteApiKeyCommand } from '../application/commands/delete-api-key.js'
import { UnauthorizedApiKeyDeletionError } from '../application/commands/delete-api-key.js'
import type { GetAccountQuery } from '../application/commands/get-account.js'
import type { GetAccountsQuery } from '../application/commands/get-accounts.js'
import type { GetApiKeysByAccountQuery } from '../application/commands/get-api-keys-by-account.js'
import type { LoginCommand } from '../application/commands/login.js'
import type { LogoutCommand } from '../application/commands/logout.js'
import type { RefreshSessionCommand } from '../application/commands/refresh-session.js'
import type { RegisterCommand } from '../application/commands/register.js'
import type { RequestPasswordResetCommand } from '../application/commands/request-password-reset.js'
import type { ResetPasswordCommand } from '../application/commands/reset-password.js'
import type { WhoamiQuery } from '../application/commands/whoami.js'
import { AccountNotFoundError } from '../application/errors/account-not-found.js'
import { InvalidLoginError } from '../application/errors/invalid-login.js'
import { NonUniqueUsernameError } from '../application/errors/non-unique-username.js'
import { PasswordResetTokenExpiredError } from '../application/errors/password-reset-token-expired.js'
import { PasswordResetTokenNotFoundError } from '../application/errors/password-reset-token-not-found.js'
import type { ValidateApiKeyCommand } from '../application/index.js'
import { CustomError } from '../domain/errors/base.js'
import { UnauthorizedError } from '../domain/errors/unauthorized.js'
import { getBearerAuthToken } from './bearer-auth-middleware.js'
import {
  createApiKeyRoute,
  deleteApiKeyRoute,
  getAccountRoute,
  getAccountsRoute,
  getApiKeysRoute,
  loginRoute,
  logoutRoute,
  refreshSessionRoute,
  registerRoute,
  requestPasswordResetRoute,
  resetPasswordRoute,
  validateApiKeyRoute,
  whoamiRoute,
} from './routes.js'

export type Router = ReturnType<typeof createAuthenticationRouter>

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
  validateApiKeyCommand(): ValidateApiKeyCommand
}

export function createAuthenticationRouter(di: AuthorizationRouterDependencies) {
  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: false,
            error: {
              name: 'ValidationError',
              message: 'Request validation failed',
              details: { target: result.target, issues: result.error.issues },
              statusCode: 400,
            },
          } as const,
          400,
        )
      }
    },
  })
    .openapi(loginRoute, async (c) => {
      const body = c.req.valid('json')

      const result = await di.loginCommand().execute(body.username, body.password)
      if (result instanceof InvalidLoginError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'InvalidLoginError',
              message: result.message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      return c.json(
        {
          success: true,
          token: result.userSession.token,
          expiresAt: result.userSession.expiresAt,
        } as const,
        200,
      )
    })

    .openapi(logoutRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      await di.logoutCommand().execute(token)

      return c.json({ success: true } as const, 200)
    })

    .openapi(registerRoute, async (c) => {
      const body = c.req.valid('json')

      const result = await di.registerCommand().execute(body.username, body.password)
      if (result instanceof NonUniqueUsernameError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'NonUniqueUsernameError',
              message: result.message,
              statusCode: 409,
            },
          } as const,
          409,
        )
      }

      return c.json(
        {
          success: true,
          token: result.newUserSession.token,
          expiresAt: result.newUserSession.expiresAt,
        } as const,
        200,
      )
    })

    .openapi(requestPasswordResetRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const { userId } = c.req.valid('param')

      const whoamiResult = await di.whoamiQuery().execute(token)
      if (whoamiResult instanceof UnauthorizedError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: whoamiResult.message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const passwordResetToken = await di
        .requestPasswordResetCommand()
        .execute(userId, whoamiResult.account.id)
      if (passwordResetToken instanceof UnauthorizedError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: passwordResetToken.message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      } else if (passwordResetToken instanceof AccountNotFoundError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'AccountNotFoundError',
              message: passwordResetToken.message,
              statusCode: 404,
            },
          } as const,
          404,
        )
      }

      // FIXME: We probably shouldn't be hardcoding this
      const passwordResetLink = 'https://www.romulus.lol/reset-password/' + passwordResetToken
      return c.json({ success: true, passwordResetLink } as const, 200)
    })

    .openapi(resetPasswordRoute, async (c) => {
      const body = c.req.valid('json')
      const passwordResetToken = c.req.param('token')

      const result = await di.resetPasswordCommand().execute(passwordResetToken, body.password)
      if (
        result instanceof PasswordResetTokenNotFoundError ||
        result instanceof PasswordResetTokenExpiredError
      ) {
        return c.json(
          {
            success: false,
            error: {
              name: 'InvalidPasswordResetTokenError',
              message: new InvalidPasswordResetTokenError().message,
              statusCode: 400,
            },
          } as const,
          400,
        )
      } else if (result instanceof AccountNotFoundError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'AccountNotFoundError',
              message: result.message,
              statusCode: 404,
            },
          } as const,
          404,
        )
      }

      return c.json(
        {
          success: true,
          token: result.userSession.token,
          expiresAt: result.userSession.expiresAt,
        } as const,
        200,
      )
    })

    .openapi(whoamiRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const result = await di.whoamiQuery().execute(token)
      if (result instanceof UnauthorizedError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      return c.json({ success: true, ...result } as const, 200)
    })

    .openapi(getAccountRoute, async (c) => {
      const { id } = c.req.valid('param')

      const result = await di.getAccountQuery().execute(id)
      if (result instanceof AccountNotFoundError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'AccountNotFoundError',
              message: result.message,
              statusCode: 404,
            },
          } as const,
          404,
        )
      }

      return c.json({ success: true, account: result } as const, 200)
    })

    .openapi(getAccountsRoute, async (c) => {
      const ids = c.req.valid('query').id

      const result = await di.getAccountsQuery().execute(ids)

      return c.json({ success: true, accounts: result } as const, 200)
    })

    .openapi(refreshSessionRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const result = await di.refreshSessionCommand().execute(token)
      if (result instanceof UnauthorizedError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      return c.json(
        { success: true, token: result.token, expiresAt: result.expiresAt } as const,
        200,
      )
    })

    .openapi(createApiKeyRoute, async (c) => {
      const name = c.req.valid('json').name

      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResult = await di.whoamiQuery().execute(token)
      if (whoamiResult instanceof UnauthorizedError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const result = await di.createApiKeyCommand().execute(name, whoamiResult.account.id)

      return c.json(
        { success: true, id: result.id, name: result.name, key: result.key } as const,
        200,
      )
    })

    .openapi(deleteApiKeyRoute, async (c) => {
      const id = c.req.valid('param').id

      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResult = await di.whoamiQuery().execute(token)
      if (whoamiResult instanceof UnauthorizedError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const result = await di.deleteApiKeyCommand().execute(id, whoamiResult.account.id)
      if (result instanceof UnauthorizedApiKeyDeletionError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      return c.json({ success: true } as const, 200)
    })

    .openapi(getApiKeysRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResult = await di.whoamiQuery().execute(token)
      if (whoamiResult instanceof UnauthorizedError) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthorizedError',
              message: new UnauthorizedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const result = await di.getApiKeysByAccountQuery().execute(whoamiResult.account.id)

      return c.json({ success: true, keys: result } as const, 200)
    })

    .openapi(validateApiKeyRoute, async (c) => {
      const key = c.req.valid('param').key
      const result = await di.validateApiKeyCommand().execute(key)
      return c.json({ success: true, valid: result } as const, 200)
    })

  app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
  })

  return app
}

class InvalidPasswordResetTokenError extends CustomError {
  constructor() {
    super('InvalidPasswordResetTokenError', 'Invalid password reset token')
  }
}
