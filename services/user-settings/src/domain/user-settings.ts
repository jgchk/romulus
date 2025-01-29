import { CustomError } from '@romulus/custom-error'

export type UserSettingsData = {
  genreRelevanceFilter: number | undefined
  showRelevanceTags: boolean
  showTypeTags: boolean
  showNsfw: boolean
  darkMode: boolean
}

export class UserSettings {
  private userId: number
  private settings: UserSettingsData

  private constructor(userId: number, settings: UserSettingsData) {
    this.userId = userId
    this.settings = settings
  }

  static fromData(userId: number, settings: UserSettingsData): UserSettings {
    return new UserSettings(userId, settings)
  }

  static default(userId: number): UserSettings {
    return new UserSettings(userId, {
      genreRelevanceFilter: undefined,
      showRelevanceTags: false,
      showTypeTags: true,
      showNsfw: false,
      darkMode: true,
    })
  }

  update(settings: UserSettingsData): void | InvalidGenreRelevanceFilterError {
    const isGenreRelevanceFilterValid =
      settings.genreRelevanceFilter === undefined ||
      (settings.genreRelevanceFilter >= MIN_GENRE_RELEVANCE &&
        settings.genreRelevanceFilter <= MAX_GENRE_RELEVANCE)
    if (!isGenreRelevanceFilterValid)
      return new InvalidGenreRelevanceFilterError(settings.genreRelevanceFilter)

    this.settings = settings
  }

  getUserId(): number {
    return this.userId
  }

  getSettings(): UserSettingsData {
    return this.settings
  }
}

export const MIN_GENRE_RELEVANCE = 0
export const MAX_GENRE_RELEVANCE = 7

export class InvalidGenreRelevanceFilterError extends CustomError {
  constructor(public readonly genreRelevanceFilter: number | undefined) {
    super(
      'InvalidGenreRelevanceFilterError',
      `Relevance must be between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive)`,
    )
  }
}

export class UnauthorizedError extends CustomError {
  constructor() {
    super('UnauthorizedError', 'You are not authorized to perform this action')
  }
}
