import type { IUserSettingsRepository } from '../domain/repository.js'
import type { UserSettingsData } from '../domain/user-settings.js'
import { InvalidGenreRelevanceFilterError } from '../domain/user-settings.js'

export type UpdateUserSettingsCommand = {
  userId: number
  settings: UserSettingsData
}

export class UpdateUserSettingsCommandHandler {
  constructor(private repo: IUserSettingsRepository) {}

  async handle(
    command: UpdateUserSettingsCommand,
  ): Promise<void | InvalidGenreRelevanceFilterError> {
    const settings = await this.repo.get(command.userId)

    const result = settings.update(command.settings)
    if (result instanceof InvalidGenreRelevanceFilterError) {
      return result
    }

    await this.repo.save(settings)
  }
}
