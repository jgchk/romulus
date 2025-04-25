import { NewAccount } from '../../domain/entities/account.js'
import { Session } from '../../domain/entities/session.js'
import { NonUniqueUsernameError as DomainNonUniqueUsernameError } from '../../domain/errors/non-unique-username.js'
import { type AccountRepository } from '../../domain/repositories/account.js'
import { type HashRepository } from '../../domain/repositories/hash-repository.js'
import { type SessionRepository } from '../../domain/repositories/session.js'
import { type TokenGenerator } from '../../domain/repositories/token-generator.js'
import { NonUniqueUsernameError } from '../errors/non-unique-username.js'

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
