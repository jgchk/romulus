import { pglite } from '@romulus/authentication/infrastructure'
import { expect } from 'vitest'

import { migrateUsers } from './migrate.js'
import { test } from './vitest-setup.js'

test('should migrate all users', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migrateUsers(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const accounts = await drizzle.query.accountsTable.findMany({
    orderBy: (table, { asc, sql }) => asc(sql`(lower(${table.username}))`),
  })
  expect(accounts).toHaveLength(111)
  expect(accounts[0]).toEqual({
    id: 58,
    username: ';--ss',
    password: expect.any(String) as string,
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
  })
  expect(accounts[accounts.length - 1]).toEqual({
    id: 89,
    username: 'ZoeARozeta',
    password: expect.any(String) as string,
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
  })
})
