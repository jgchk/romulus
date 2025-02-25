import { pglite } from '@romulus/user-settings/infrastructure'
import { expect } from 'vitest'

import { test } from '../vitest-setup.js'
import { migrateUserSettings } from './user-settings.js'

test('should migrate all user settings', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateUserSettings(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const accounts = await drizzle.query.userSettingsTable.findMany({
    orderBy: (table, { asc }) => asc(table.id),
  })
  expect(accounts).toHaveLength(111)
  expect(accounts[0]).toEqual({
    id: 1,
    genreRelevanceFilter: 6,
    showRelevanceTags: false,
    showTypeTags: true,
    showNsfw: true,
    darkMode: true,
  })
  expect(accounts[accounts.length - 1]).toEqual({
    id: 150,
    genreRelevanceFilter: 0,
    showRelevanceTags: true,
    showTypeTags: true,
    showNsfw: true,
    darkMode: true,
  })
})
