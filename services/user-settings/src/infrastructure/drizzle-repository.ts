import { eq } from 'drizzle-orm'

import type { IUserSettingsRepository } from '../domain/repository.js'
import { UserSettings } from '../domain/user-settings.js'
import type { IDrizzleConnection } from './drizzle-database.js'
import { userSettingsTable } from './drizzle-schema.js'

export const UNSET_GENRE_RELEVANCE = 99

export class DrizzleUserSettingsRepository implements IUserSettingsRepository {
  constructor(private db: IDrizzleConnection) {}

  async get(userId: number) {
    const data = await this.db.query.userSettingsTable.findFirst({
      where: eq(userSettingsTable.id, userId),
    })

    if (data === undefined) {
      return UserSettings.default(userId)
    }

    return UserSettings.fromData(userId, {
      genreRelevanceFilter:
        data.genreRelevanceFilter === UNSET_GENRE_RELEVANCE ? undefined : data.genreRelevanceFilter,
      showRelevanceTags: data.showRelevanceTags,
      showTypeTags: data.showTypeTags,
      showNsfw: data.showNsfw,
      darkMode: data.darkMode,
    })
  }

  async save(settings: UserSettings) {
    const userId = settings.getUserId()
    const data = settings.getSettings()

    const dbData = {
      genreRelevanceFilter: data.genreRelevanceFilter ?? UNSET_GENRE_RELEVANCE,
      showRelevanceTags: data.showRelevanceTags,
      showTypeTags: data.showTypeTags,
      showNsfw: data.showNsfw,
      darkMode: data.darkMode,
    }

    await this.db
      .insert(userSettingsTable)
      .values({
        id: userId,
        ...dbData,
      })
      .onConflictDoUpdate({
        target: [userSettingsTable.id],
        set: dbData,
      })
  }
}
