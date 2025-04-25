import { type ApiKeyRepository } from '../../domain/repositories/api-key.js'
import { ApplicationError } from '../errors/base.js'

export class DeleteApiKeyCommand {
  constructor(private apiKeyRepo: ApiKeyRepository) {}

  async execute(id: number, accountId: number): Promise<void | UnauthorizedApiKeyDeletionError> {
    const apiKey = await this.apiKeyRepo.findById(id)
    if (!apiKey) return

    const isOwnApiKey = apiKey.accountId === accountId
    if (!isOwnApiKey) {
      return new UnauthorizedApiKeyDeletionError()
    }

    await this.apiKeyRepo.deleteById(id)
  }
}

export class UnauthorizedApiKeyDeletionError extends ApplicationError {
  constructor() {
    super('UnauthorizedError', 'You may only delete your own API keys')
  }
}
