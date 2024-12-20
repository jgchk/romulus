import type { IAuthorizationClient } from '@romulus/authorization/client'
import { Hono } from 'hono'
import { z } from 'zod'

import { CreateApiKeyCommand } from '../application/commands/create-api-key'
import {
  DeleteApiKeyCommand,
  UnauthorizedApiKeyDeletionError,
} from '../application/commands/delete-api-key'
import { GetAccountQuery } from '../application/commands/get-account'
import { GetAccountsQuery } from '../application/commands/get-accounts'
import { GetApiKeysByAccountQuery } from '../application/commands/get-api-keys-by-account'
import { LoginCommand } from '../application/commands/login'
import { LogoutCommand } from '../application/commands/logout'
import { RefreshSessionCommand } from '../application/commands/refresh-session'
import { RegisterCommand } from '../application/commands/register'
import { RequestPasswordResetCommand } from '../application/commands/request-password-reset'
import { ResetPasswordCommand } from '../application/commands/reset-password'
import { WhoamiQuery } from '../application/commands/whoami'
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

export function createRouter(
  di: CommandsCompositionRoot,
  getAuthorizationClient: (sessionToken: string) => IAuthorizationClient,
) {
  const app = new Hono()
    .post(
      '/login',
      zodValidator('json', z.object({ username: z.string(), password: z.string() })),
      async (c) => {
        const body = c.req.valid('json')

        const loginCommand = new LoginCommand(
          di.accountRepository(),
          di.sessionRepository(),
          di.passwordHashRepository(),
          di.sessionTokenHashRepository(),
          di.sessionTokenGenerator(),
        )
        const result = await loginCommand.execute(body.username, body.password)
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

      const logoutCommand = new LogoutCommand(
        di.sessionRepository(),
        di.sessionTokenHashRepository(),
      )
      await logoutCommand.execute(sessionToken)

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

        const registerCommand = new RegisterCommand(
          di.accountRepository(),
          di.sessionRepository(),
          di.passwordHashRepository(),
          di.sessionTokenHashRepository(),
          di.sessionTokenGenerator(),
        )
        const result = await registerCommand.execute(body.username, body.password)
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

        const requestPasswordResetCommand = new RequestPasswordResetCommand(
          di.passwordResetTokenRepository(),
          di.passwordResetTokenGenerator(),
          di.passwordResetTokenHashRepository(),
          di.accountRepository(),
          getAuthorizationClient(sessionToken),
        )
        const passwordResetToken = await requestPasswordResetCommand.execute(accountId)
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

        const resetPasswordCommand = new ResetPasswordCommand(
          di.accountRepository(),
          di.sessionRepository(),
          di.passwordResetTokenRepository(),
          di.passwordResetTokenHashRepository(),
          di.passwordHashRepository(),
          di.sessionTokenHashRepository(),
          di.sessionTokenGenerator(),
        )
        const result = await resetPasswordCommand.execute(passwordResetToken, body.password)
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

      const whoamiQuery = new WhoamiQuery(
        di.accountRepository(),
        di.sessionRepository(),
        di.sessionTokenHashRepository(),
      )
      const result = await whoamiQuery.execute(sessionToken)
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

        const getAccountQuery = new GetAccountQuery(di.accountRepository())
        const result = await getAccountQuery.execute(id)
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

        const getAccountsQuery = new GetAccountsQuery(di.accountRepository())
        const result = await getAccountsQuery.execute(ids)

        return c.json({ success: true, accounts: result } as const)
      },
    )

    .post('/refresh-session', bearerAuth, async (c) => {
      const sessionToken = c.var.token

      const refreshSessionCommand = new RefreshSessionCommand(
        di.sessionRepository(),
        di.sessionTokenHashRepository(),
      )
      const result = await refreshSessionCommand.execute(sessionToken)
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

        const whoamiQuery = new WhoamiQuery(
          di.accountRepository(),
          di.sessionRepository(),
          di.sessionTokenHashRepository(),
        )
        const whoamiResult = await whoamiQuery.execute(sessionToken)
        if (whoamiResult instanceof UnauthorizedError) {
          return setError(c, whoamiResult, 401)
        }

        const createApiKeyCommand = new CreateApiKeyCommand(
          di.apiKeyRepository(),
          di.apiKeyTokenGenerator(),
          di.apiKeyHashRepository(),
        )
        const result = await createApiKeyCommand.execute(name, whoamiResult.account.id)

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

        const whoamiQuery = new WhoamiQuery(
          di.accountRepository(),
          di.sessionRepository(),
          di.sessionTokenHashRepository(),
        )
        const whoamiResult = await whoamiQuery.execute(sessionToken)
        if (whoamiResult instanceof UnauthorizedError) {
          return setError(c, whoamiResult, 401)
        }

        const deleteApiKeyCommand = new DeleteApiKeyCommand(di.apiKeyRepository())
        const result = await deleteApiKeyCommand.execute(id, whoamiResult.account.id)
        if (result instanceof UnauthorizedApiKeyDeletionError) {
          return setError(c, result, 401)
        }

        return c.json({ success: true } as const)
      },
    )

    .get('/me/api-keys', bearerAuth, async (c) => {
      const sessionToken = c.var.token

      const whoamiQuery = new WhoamiQuery(
        di.accountRepository(),
        di.sessionRepository(),
        di.sessionTokenHashRepository(),
      )
      const whoamiResult = await whoamiQuery.execute(sessionToken)
      if (whoamiResult instanceof UnauthorizedError) {
        return setError(c, whoamiResult, 401)
      }

      const getApiKeysQuery = new GetApiKeysByAccountQuery(di.dbConnection())
      const result = await getApiKeysQuery.execute(whoamiResult.account.id)

      return c.json({ success: true, keys: result } as const)
    })

  return app
}

class InvalidPasswordResetTokenError extends CustomError {
  constructor() {
    super('InvalidPasswordResetTokenError', 'Invalid password reset token')
  }
}
