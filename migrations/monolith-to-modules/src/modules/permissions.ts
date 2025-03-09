import { setupAuthenticationPermissions } from '@romulus/authentication/application'
import { setupAuthorizationPermissions } from '@romulus/authorization/application'
import { setupGenresPermissions } from '@romulus/genres/application'
import postgres from 'postgres'

import { env } from '../env.js'

export async function migratePermissions(
  migrateSchema: () => Promise<void>,
  execQuery: (query: string) => Promise<void>,
) {
  await execQuery('drop schema if exists public cascade')
  await execQuery('create schema public')
  await execQuery('drop schema if exists drizzle cascade')

  await migrateSchema()

  async function insertPermissions(permissions: { name: string; description?: string }[]) {
    if (permissions.length === 0) return

    await execQuery(`
      INSERT INTO "permissions"
        (name, description)
      VALUES
        ${permissions.map((permission) => `('${permission.name}', ${permission.description === undefined ? 'null' : `'${permission.description}'`})`).join(', ')}
    `)
  }

  await setupAuthenticationPermissions(insertPermissions)
  await setupAuthorizationPermissions(insertPermissions)
  await setupGenresPermissions(insertPermissions)

  await execQuery(`
    INSERT INTO "roles"
      (name, description)
    VALUES
      ('admin', null),
      ('genre-editor', null),
      ('default', null)
  `)

  await execQuery(`
    INSERT INTO "default_role"
      (role_name)
    VALUES
      ('default')
  `)

  await execQuery(`
    INSERT INTO "role_permissions"
      (role_id, permission_name)
    VALUES
      ('default', 'authorization:check-own-permissions'),
      ('default', 'authorization:get-own-permissions'),
      ('genre-editor', 'genres:create-genres'),
      ('genre-editor', 'genres:edit-genres'),
      ('genre-editor', 'genres:delete-genres'),
      ('genre-editor', 'genres:vote-genre-relevance'),
      ('admin', 'authentication:request-password-reset'),
      ('admin', 'authorization:create-permissions'),
      ('admin', 'authorization:delete-permissions'),
      ('admin', 'authorization:create-roles'),
      ('admin', 'authorization:delete-roles'),
      ('admin', 'authorization:assign-roles'),
      ('admin', 'authorization:check-user-permissions'),
      ('admin', 'authorization:get-user-permissions'),
      ('admin', 'authorization:get-all-permissions')
  `)

  const monolith = postgres(env.MONOLITH_DATABASE_URL)
  const genreEditors = (
    await monolith`SELECT id FROM "Account" WHERE 'EDIT_GENRES'=any("permissions")`
  ).map((row) => row.id as number)

  if (genreEditors.length > 0) {
    await execQuery(`
    INSERT INTO "user_roles"
      (user_id, role_name)
    VALUES
      ${genreEditors.map((userId) => `(${userId}, 'genre-editor')`).join(', ')}
  `)
  }
}
