import type { AccountRepository } from '../../domain/repositories/account'
import type { HashRepository } from '../../domain/repositories/hash-repository'
import type { SessionRepository } from '../../domain/repositories/session'

export class GetSessionCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private sessionTokenHashRepo: HashRepository,
  ) {}

  async execute(sessionToken: string): Promise<
    | { account: undefined; session: undefined }
    | {
        account: {
          id: number
          username: string
          genreRelevanceFilter: number
          showRelevanceTags: boolean
          showTypeTags: boolean
          showNsfw: boolean
          darkMode: boolean
        }
        session: { expiresAt: Date }
      }
  > {
    const tokenHash = await this.sessionTokenHashRepo.hash(sessionToken)

    const session = await this.sessionRepo.findByTokenHash(tokenHash)
    if (!session) {
      return { account: undefined, session: undefined }
    }
    const sessionOutput = {
      expiresAt: session.expiresAt,
    }

    if (Date.now() >= session.expiresAt.getTime()) {
      await this.sessionRepo.delete(tokenHash)
      return { account: undefined, session: undefined }
    }

    const account = await this.accountRepo.findById(session.accountId)
    if (!account) {
      return { account: undefined, session: undefined }
    }

    const accountOutput = {
      id: account.id,
      username: account.username,
      genreRelevanceFilter: account.genreRelevanceFilter,
      showRelevanceTags: account.showRelevanceTags,
      showTypeTags: account.showTypeTags,
      showNsfw: account.showNsfw,
      darkMode: account.darkMode,
    }

    return {
      account: accountOutput,
      session: sessionOutput,
    }
  }
}
