import { eq } from 'drizzle-orm'

import { Authorizer, DefaultRoleSetEvent } from '../domain/authorizer.js'
import { Role, RoleAssignedToUserEvent } from '../domain/authorizer.js'
import {
  Permission,
  PermissionDeletedEvent,
  RoleCreatedEvent,
  RoleDeletedEvent,
} from '../domain/authorizer.js'
import { PermissionCreatedEvent } from '../domain/authorizer.js'
import type { IAuthorizerRepository } from '../domain/repository.js'
import type { IDrizzleConnection } from './drizzle-database.js'
import {
  defaultRoleTable,
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
  userRolesTable,
} from './drizzle-schema.js'

export class DrizzleAuthorizerRepository implements IAuthorizerRepository {
  constructor(private db: IDrizzleConnection) {}

  async get() {
    const permissions = await this.db.query.permissionsTable.findMany()
    const roles = await this.db.query.rolesTable.findMany({
      with: {
        permissions: {
          columns: {
            permissionName: true,
          },
        },
      },
    })
    const userRoles = await this.db.query.userRolesTable.findMany()

    const permissionsMap = new Map(
      permissions.map((p) => [p.name, new Permission(p.name, p.description ?? undefined)]),
    )
    const rolesMap = new Map(
      roles.map((r) => [
        r.name,
        new Role(
          r.name,
          new Set(r.permissions.map((p) => p.permissionName)),
          r.description ?? undefined,
        ),
      ]),
    )

    const userRolesMap = new Map<number, Set<string>>()
    for (const ur of userRoles) {
      const roles = userRolesMap.get(ur.userId) ?? new Set()
      roles.add(ur.roleName)
      userRolesMap.set(ur.userId, roles)
    }

    const defaultRole = await this.db.query.defaultRoleTable
      .findFirst()
      .then((row) => row?.roleName)

    return Authorizer.fromState(permissionsMap, rolesMap, defaultRole, userRolesMap)
  }

  async save(authorizer: Authorizer) {
    const events = authorizer.getUncommittedEvents()
    for (const event of events) {
      if (event instanceof PermissionCreatedEvent) {
        await this.db
          .insert(permissionsTable)
          .values({
            name: event.name,
            description: event.description,
          })
          .onConflictDoUpdate({
            target: [permissionsTable.name],
            set: {
              description: event.description ?? null,
            },
          })
      } else if (event instanceof PermissionDeletedEvent) {
        await this.db.delete(permissionsTable).where(eq(permissionsTable.name, event.name))
      } else if (event instanceof RoleCreatedEvent) {
        await this.db.transaction(async (tx) => {
          await tx
            .insert(rolesTable)
            .values({
              name: event.name,
              description: event.description,
            })
            .onConflictDoUpdate({
              target: [rolesTable.name],
              set: {
                description: event.description ?? null,
              },
            })

          await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleName, event.name))
          await tx.insert(rolePermissionsTable).values(
            [...event.permissions].map((p) => ({
              roleName: event.name,
              permissionName: p,
            })),
          )
        })
      } else if (event instanceof RoleDeletedEvent) {
        await this.db.delete(rolesTable).where(eq(rolesTable.name, event.name))
      } else if (event instanceof DefaultRoleSetEvent) {
        await this.db.transaction(async (tx) => {
          await tx.delete(defaultRoleTable)
          await tx.insert(defaultRoleTable).values({ roleName: event.name })
        })
      } else if (event instanceof RoleAssignedToUserEvent) {
        await this.db
          .insert(userRolesTable)
          .values({
            userId: event.userId,
            roleName: event.roleName,
          })
          .onConflictDoNothing()
      } else {
        event satisfies never
      }
    }
  }
}
