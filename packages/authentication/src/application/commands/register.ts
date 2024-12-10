import { NewAccount } from '../../commands/domain/entities/account'
import { Session } from '../../commands/domain/entities/session'
import { NonUniqueUsernameError as DomainNonUniqueUsernameError } from '../../commands/domain/errors/non-unique-username'
import type { AccountRepository } from '../../commands/domain/repositories/account'
import type { HashRepository } from '../../commands/domain/repositories/hash-repository'
import type { SessionRepository } from '../../commands/domain/repositories/session'
import type { TokenGenerator } from '../../commands/domain/repositories/token-generator'
import { NonUniqueUsernameError } from '../errors/non-unique-username'

export type RegisterResult = {
  newUserAccount: {
    id: number
  }
  newUserSession: {
    token: string
    expiresAt: Date
  }
}

export class RegisterCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private passwordHashRepo: HashRepository,
    private sessionTokenHashRepo: HashRepository,
    private sessionTokenGenerator: TokenGenerator,
  ) {}

  async execute(
    username: string,
    password: string,
  ): Promise<RegisterResult | NonUniqueUsernameError> {
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

    const tokenHash = await this.sessionTokenHashRepo.hash(token)
    const session = new Session(
      account.id,
      tokenHash,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    )

    await this.sessionRepo.save(session)

    return {
      newUserAccount: { id: account.id },
      newUserSession: {
        token,
        expiresAt: session.expiresAt,
      },
    }
  }
}
