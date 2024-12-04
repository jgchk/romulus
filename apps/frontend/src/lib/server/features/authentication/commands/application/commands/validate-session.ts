import type { HashRepository } from '$lib/server/features/common/domain/repositories/hash'

import type { Permission } from '../../domain/entities/account'
import type { AccountRepository } from '../../domain/repositories/account'
import type { SessionRepository } from '../../domain/repositories/session'

export type ValidateSessionResult =
  | {
      userAccount: {
        id: number
        username: string
        permissions: Set<Permission>
        genreRelevanceFilter: number
        showRelevanceTags: boolean
        showTypeTags: boolean
        showNsfw: boolean
        darkMode: boolean
      }
      userSession:
        | {
            status: 'valid'
            expiresAt: Date
          }
        | {
            status: 'refreshed'
            token: string
            expiresAt: Date
          }
    }
  | {
      userAccount: undefined
      userSession: undefined
    }

export class ValidateSessionCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private sessionTokenHashRepo: HashRepository,
  ) {}

  async execute(sessionToken: string): Promise<ValidateSessionResult> {
    const tokenHash = await this.sessionTokenHashRepo.hash(sessionToken)

    const session = await this.sessionRepo.findByTokenHash(tokenHash)

    if (!session) {
      return { userAccount: undefined, userSession: undefined }
    }

    const account = await this.accountRepo.findById(session.accountId)
    if (!account) {
      return { userAccount: undefined, userSession: undefined }
    }

    if (Date.now() >= session.expiresAt.getTime()) {
      await this.sessionRepo.delete(tokenHash)
      return { userAccount: undefined, userSession: undefined }
    }

    const accountOutput = {
      id: account.id,
      username: account.username,
      permissions: account.permissions,
      genreRelevanceFilter: account.genreRelevanceFilter,
      showRelevanceTags: account.showRelevanceTags,
      showTypeTags: account.showTypeTags,
      showNsfw: account.showNsfw,
      darkMode: account.darkMode,
    }

    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      await this.sessionRepo.save(session)
      return {
        userAccount: accountOutput,
        userSession: { status: 'refreshed', token: sessionToken, expiresAt: session.expiresAt },
      }
    }

    return {
      userAccount: accountOutput,
      userSession: { status: 'valid', expiresAt: session.expiresAt },
    }
  }
}
