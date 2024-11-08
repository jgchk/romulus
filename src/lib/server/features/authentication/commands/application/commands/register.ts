import type { HashRepository } from '../../../../common/domain/repositories/hash'
import type { TokenGenerator } from '../../../../common/domain/token-generator'
import { NewAccount } from '../../domain/entities/account'
import type { Cookie } from '../../domain/entities/cookie'
import { Session } from '../../domain/entities/session'
import { InvalidTokenLengthError } from '../../domain/errors/invalid-token-length'
import { NonUniqueUsernameError as DomainNonUniqueUsernameError } from '../../domain/errors/non-unique-username'
import { type AccountRepository } from '../../domain/repositories/account'
import type { SessionRepository } from '../../domain/repositories/session'
import { NonUniqueUsernameError } from '../errors/non-unique-username'

export class RegisterCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private passwordHashRepo: HashRepository,
    private sessionTokenHashRepo: HashRepository,
    private sessionTokenGenerator: TokenGenerator,
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

    const token = this.sessionTokenGenerator.generate(20)
    if (token instanceof InvalidTokenLengthError) {
      throw token // should never happen
    }

    const tokenHash = await this.sessionTokenHashRepo.hash(token)
    const session = new Session(
      account.id,
      tokenHash,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    )

    await this.sessionRepo.save(session)

    const cookie = this.sessionRepo.createCookie({ token, expiresAt: session.expiresAt })

    return cookie
  }
}
