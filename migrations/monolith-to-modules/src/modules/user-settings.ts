import postgres from 'postgres'

import { env } from '../env.js'

export async function migrateUserSettings(
  migrateSchema: () => Promise<void>,
  execQuery: (query: string) => Promise<void>,
) {
  await migrateSchema()

  const monolith = postgres(env.MONOLITH_DATABASE_URL)
  const accounts = (await monolith`SELECT * FROM "Account"`).map((row) => ({
    id: row.id as number,
    darkMode: row.darkMode as boolean,
    genreRelevanceFilter: row.genreRelevanceFilter as number,
    showRelevanceTags: row.showRelevanceTags as boolean,
    showTypeTags: row.showTypeTags as boolean,
    showNsfw: row.showNsfw as boolean,
  }))

  if (accounts.length > 0) {
    await execQuery(`
      INSERT INTO "user_settings"
        (id, "genreRelevanceFilter", "showRelevanceTags", "showTypeTags", "showNsfw", "darkMode")
      VALUES
        ${accounts.map((account) => `(${account.id}, ${account.genreRelevanceFilter}, ${account.showRelevanceTags}, ${account.showTypeTags}, ${account.showNsfw}, ${account.darkMode})`).join(', ')}
    `)
  }
}
