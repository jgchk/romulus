import { pglite } from '@romulus/authorization/infrastructure'
import { expect } from 'vitest'

import { test } from '../vitest-setup.js'
import { migratePermissions } from './permissions.js'

test('should create roles', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migratePermissions(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const roles = await drizzle.query.rolesTable.findMany({
    orderBy: (table, { asc }) => asc(table.name),
  })
  expect(roles).toEqual([
    {
      name: 'admin',
      description: null,
    },
    {
      name: 'default',
      description: null,
    },
    {
      name: 'genre-editor',
      description: null,
    },
  ])
})

test('should set default role as default', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migratePermissions(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const defaultRole = await drizzle.query.defaultRoleTable.findMany()
  expect(defaultRole).toEqual([
    {
      roleName: 'default',
    },
  ])
})

test('should grant default permissions to default role', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migratePermissions(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const rolePermissions = await drizzle.query.rolePermissionsTable.findMany({
    where: (table, { eq }) => eq(table.roleName, 'default'),
    orderBy: (table, { asc }) => asc(table.permissionName),
  })
  expect(rolePermissions).toEqual([
    {
      roleName: 'default',
      permissionName: 'authorization:check-own-permissions',
    },
    {
      roleName: 'default',
      permissionName: 'authorization:get-own-permissions',
    },
  ])
})

test('should grant genre edit permissions to genre-editor role', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migratePermissions(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const rolePermissions = await drizzle.query.rolePermissionsTable.findMany({
    where: (table, { eq }) => eq(table.roleName, 'genre-editor'),
    orderBy: (table, { asc }) => asc(table.permissionName),
  })
  expect(rolePermissions).toEqual([
    {
      roleName: 'genre-editor',
      permissionName: 'genres:create-genres',
    },
    {
      roleName: 'genre-editor',
      permissionName: 'genres:delete-genres',
    },
    {
      roleName: 'genre-editor',
      permissionName: 'genres:edit-genres',
    },
    {
      roleName: 'genre-editor',
      permissionName: 'genres:vote-genre-relevance',
    },
  ])
})

test('should grant admin permissions to admin role', async ({ dbConnection }) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migratePermissions(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const rolePermissions = await drizzle.query.rolePermissionsTable.findMany({
    where: (table, { eq }) => eq(table.roleName, 'admin'),
    orderBy: (table, { asc }) => asc(table.permissionName),
  })
  expect(rolePermissions).toEqual([
    {
      roleName: 'admin',
      permissionName: 'authentication:request-password-reset',
    },
    {
      roleName: 'admin',
      permissionName: 'authorization:assign-roles',
    },
    {
      roleName: 'admin',
      permissionName: 'authorization:check-user-permissions',
    },
    {
      roleName: 'admin',
      permissionName: 'authorization:create-permissions',
    },
    {
      roleName: 'admin',
      permissionName: 'authorization:create-roles',
    },
    {
      roleName: 'admin',
      permissionName: 'authorization:delete-permissions',
    },
    {
      roleName: 'admin',
      permissionName: 'authorization:delete-roles',
    },
    {
      roleName: 'admin',
      permissionName: 'authorization:get-all-permissions',
    },
    {
      roleName: 'admin',
      permissionName: 'authorization:get-user-permissions',
    },
  ])
})

test('should grant genre-editor role to users who previously had the EDIT_GENRES permission', async ({
  dbConnection,
}) => {
  const drizzle = pglite.getPGliteDbConnection(dbConnection)

  await migratePermissions(
    async () => {
      await pglite.migratePGlite(drizzle)
    },
    async (query: string) => {
      await dbConnection.exec(query)
    },
  )

  const editors = [
    1, // 'mocha',
    3, // 'code_gs',
    5, // 'fourths',
    6, // 'fyr',
    7, // 'akeemTheafricandream',
    8, // 'outbreakrt',
    9, // 'jelly',
    10, // 'stolendog',
    11, // 'rikatan',
    13, // 'sc113',
  ]

  const userRoles = await drizzle.query.userRolesTable.findMany({
    where: (table, { eq }) => eq(table.roleName, 'genre-editor'),
    orderBy: (table, { asc }) => asc(table.userId),
  })
  expect(userRoles.slice(0, editors.length)).toEqual(
    editors.map((userId) => ({ userId, roleName: 'genre-editor' })),
  )
})
