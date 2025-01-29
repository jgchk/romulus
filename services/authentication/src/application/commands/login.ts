import { Session } from '../../domain/entities/session.js'
import type { AccountRepository } from '../../domain/repositories/account.js'
import type { HashRepository } from '../../domain/repositories/hash-repository.js'
import type { SessionRepository } from '../../domain/repositories/session.js'
import type { TokenGenerator } from '../../domain/repositories/token-generator.js'
import { InvalidLoginError } from '../errors/invalid-login.js'

export type LoginResult = {
  userAccount: {
    id: number
  }
  userSession: {
    token: string
    expiresAt: Date
  }
}

export class LoginCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private passwordHashRepo: HashRepository,
    private sessionTokenHashRepo: HashRepository,
    private sessionTokenGenerator: TokenGenerator,
  ) {}

  async execute(username: string, password: string): Promise<LoginResult | InvalidLoginError> {
    const account = await this.accountRepo.findByUsername(username)
    if (!account) {
      // spend some time to "waste" some time
      // this makes brute forcing harder
      await this.passwordHashRepo.hash(password)
      return new InvalidLoginError()
    }

    const validPassword = await this.passwordHashRepo.compare(password, account.passwordHash)
    if (!validPassword) {
      return new InvalidLoginError()
    }

    const token = this.sessionTokenGenerator.generate(20)

    const tokenHash = await this.sessionTokenHashRepo.hash(token)
    const session = new Session(
      account.id,
      tokenHash,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    )

    await this.sessionRepo.save(session)

    return {
      userAccount: { id: account.id },
      userSession: { token, expiresAt: session.expiresAt },
    }
  }
}
