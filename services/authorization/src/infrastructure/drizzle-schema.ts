import { relations } from 'drizzle-orm'
import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'

export const defaultRoleTable = pgTable('default_role', {
  roleName: text('role_name')
    .primaryKey()
    .notNull()
    .references(() => rolesTable.name, { onDelete: 'cascade' }),
})

export const permissionsTable = pgTable('permissions', {
  name: text('name').primaryKey().notNull(),
  description: text('description'),
})

export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
  roles: many(rolePermissionsTable),
}))

export const rolesTable = pgTable('roles', {
  name: text('name').primaryKey().notNull(),
  description: text('description'),
})

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  permissions: many(rolePermissionsTable),
}))

export const rolePermissionsTable = pgTable(
  'role_permissions',
  {
    roleName: text('role_id')
      .references(() => rolesTable.name, { onDelete: 'cascade' })
      .notNull(),
    permissionName: text('permission_name')
      .references(() => permissionsTable.name, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleName, table.permissionName] }),
  }),
)

export const rolePermissionsRelations = relations(rolePermissionsTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [rolePermissionsTable.roleName],
    references: [rolesTable.name],
  }),
  permission: one(permissionsTable, {
    fields: [rolePermissionsTable.permissionName],
    references: [permissionsTable.name],
  }),
}))

export const userRolesTable = pgTable(
  'user_roles',
  {
    userId: integer('user_id').notNull(),
    roleName: text('role_name')
      .references(() => rolesTable.name, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleName] }),
  }),
)

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [userRolesTable.roleName],
    references: [rolesTable.name],
  }),
}))
