import type { IAuthorizationClient } from '@romulus/authorization/client'

import type { AccountRepository } from '../domain/repositories/account'
import type { HashRepository } from '../domain/repositories/hash-repository'
import type { PasswordResetTokenRepository } from '../domain/repositories/password-reset-token'
import type { SessionRepository } from '../domain/repositories/session'
import type { TokenGenerator } from '../domain/repositories/token-generator'
import { GetAccountQuery } from './commands/get-account'
import { LoginCommand } from './commands/login'
import { LogoutCommand } from './commands/logout'
import { RefreshSessionCommand } from './commands/refresh-session'
import { RegisterCommand } from './commands/register'
import { RequestPasswordResetCommand } from './commands/request-password-reset'
import { ResetPasswordCommand } from './commands/reset-password'
import { WhoamiQuery } from './commands/whoami'

export type IAuthenticationApplication = {
  getAccount: GetAccountQuery['execute']
  whoami: WhoamiQuery['execute']
  login: LoginCommand['execute']
  logout: LogoutCommand['execute']
  refreshSession: RefreshSessionCommand['execute']
  register: RegisterCommand['execute']
  requestPasswordReset: RequestPasswordResetCommand['execute']
  resetPassword: ResetPasswordCommand['execute']
}

export class AuthenticationApplication implements IAuthenticationApplication {
  getAccount: GetAccountQuery['execute']
  whoami: WhoamiQuery['execute']
  login: LoginCommand['execute']
  logout: LogoutCommand['execute']
  refreshSession: RefreshSessionCommand['execute']
  register: RegisterCommand['execute']
  requestPasswordReset: RequestPasswordResetCommand['execute']
  resetPassword: ResetPasswordCommand['execute']

  constructor(
    accountRepo: AccountRepository,
    sessionRepo: SessionRepository,
    sessionTokenHashRepo: HashRepository,
    passwordHashRepo: HashRepository,
    sessionTokenGenerator: TokenGenerator,
    passwordResetTokenRepo: PasswordResetTokenRepository,
    passwordResetTokenGenerator: TokenGenerator,
    passwordResetTokenHashRepo: HashRepository,
    authorization: IAuthorizationClient,
  ) {
    const getAccountCommand = new GetAccountQuery(accountRepo)
    const whoamiQuery = new WhoamiQuery(accountRepo, sessionRepo, sessionTokenHashRepo)
    const loginCommand = new LoginCommand(
      accountRepo,
      sessionRepo,
      passwordHashRepo,
      sessionTokenHashRepo,
      sessionTokenGenerator,
    )
    const logoutCommand = new LogoutCommand(sessionRepo, sessionTokenHashRepo)
    const refreshSessionCommand = new RefreshSessionCommand(sessionRepo, sessionTokenHashRepo)
    const registerCommand = new RegisterCommand(
      accountRepo,
      sessionRepo,
      passwordHashRepo,
      sessionTokenHashRepo,
      sessionTokenGenerator,
    )
    const requestPasswordResetCommand = new RequestPasswordResetCommand(
      passwordResetTokenRepo,
      passwordResetTokenGenerator,
      passwordResetTokenHashRepo,
      accountRepo,
      authorization,
    )
    const resetPasswordCommand = new ResetPasswordCommand(
      accountRepo,
      sessionRepo,
      passwordResetTokenRepo,
      passwordResetTokenHashRepo,
      passwordHashRepo,
      sessionTokenHashRepo,
      sessionTokenGenerator,
    )

    this.getAccount = getAccountCommand.execute.bind(getAccountCommand)
    this.whoami = whoamiQuery.execute.bind(whoamiQuery)
    this.login = loginCommand.execute.bind(loginCommand)
    this.logout = logoutCommand.execute.bind(logoutCommand)
    this.refreshSession = refreshSessionCommand.execute.bind(refreshSessionCommand)
    this.register = registerCommand.execute.bind(registerCommand)
    this.requestPasswordReset = requestPasswordResetCommand.execute.bind(
      requestPasswordResetCommand,
    )
    this.resetPassword = resetPasswordCommand.execute.bind(resetPasswordCommand)
  }
}
