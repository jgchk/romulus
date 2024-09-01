import { NewAccount } from '../../domain/entities/account'
import type { Cookie } from '../../domain/entities/cookie'
import { NewSession } from '../../domain/entities/session'
import { NonUniqueUsernameError as DomainNonUniqueUsernameError } from '../../domain/errors/non-unique-username'
import { type AccountRepository } from '../../domain/repositories/account'
import type { HashRepository } from '../../domain/repositories/hash'
import type { SessionRepository } from '../../domain/repositories/session'
import { NonUniqueUsernameError } from '../errors/non-unique-username'

export class RegisterCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private passwordHashRepo: HashRepository,
  ) {}

  async execute(username: string, password: string): Promise<Cookie | NonUniqueUsernameError> {
    const newAccount = new NewAccount({
      username,
      passwordHash: await this.passwordHashRepo.hash(password),
    })

    const maybeAccount = await this.accountRepo.create(newAccount)
    if (maybeAccount instanceof DomainNonUniqueUsernameError) {
      return new NonUniqueUsernameError(maybeAccount.username)
    }
    const account = maybeAccount

    const session = await this.sessionRepo.create(new NewSession(account.id))

    const cookie = this.sessionRepo.createCookie(session.id)

    return cookie
  }
}
