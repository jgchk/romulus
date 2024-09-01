import type { HashRepository } from '../../../common/domain/repositories/hash'
import type { Cookie } from '../../domain/entities/cookie'
import { NewSession } from '../../domain/entities/session'
import type { AccountRepository } from '../../domain/repositories/account'
import type { SessionRepository } from '../../domain/repositories/session'
import { InvalidLoginError } from '../errors/invalid-login'

export class LoginCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private passwordHashRepo: HashRepository,
  ) {}

  async execute(username: string, password: string): Promise<Cookie | InvalidLoginError> {
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

    const session = await this.sessionRepo.create(new NewSession(account.id))

    const cookie = this.sessionRepo.createCookie(session.id)

    return cookie
  }
}
