import { eq } from 'drizzle-orm'

import { Authorizer } from '../domain/authorizer'
import { Role, RoleAssignedToUserEvent } from '../domain/authorizer'
import {
  Permission,
  PermissionDeletedEvent,
  RoleCreatedEvent,
  RoleDeletedEvent,
} from '../domain/authorizer'
import { PermissionCreatedEvent } from '../domain/authorizer'
import type { IAuthorizerRepository } from '../domain/repository'
import type { IDrizzleConnection } from './drizzle-database'
import {
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
  userRolesTable,
} from './drizzle-schema'

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

    return Authorizer.fromState(permissionsMap, rolesMap, userRolesMap)
  }

  async save(authorizer: Authorizer) {
    const events = authorizer.getUncommittedEvents()
    for (const event of events) {
      if (event instanceof PermissionCreatedEvent) {
        await this.db.insert(permissionsTable).values({
          name: event.name,
          description: event.description,
        })
      } else if (event instanceof PermissionDeletedEvent) {
        await this.db.delete(permissionsTable).where(eq(permissionsTable.name, event.name))
      } else if (event instanceof RoleCreatedEvent) {
        await this.db.insert(rolesTable).values({
          name: event.name,
          description: event.description,
        })
        await this.db.insert(rolePermissionsTable).values(
          [...event.permissions].map((p) => ({
            roleName: event.name,
            permissionName: p,
          })),
        )
      } else if (event instanceof RoleDeletedEvent) {
        await this.db.delete(rolesTable).where(eq(rolesTable.name, event.name))
      } else if (event instanceof RoleAssignedToUserEvent) {
        await this.db.insert(userRolesTable).values({
          userId: event.userId,
          roleName: event.roleName,
        })
      } else {
        event satisfies never
      }
    }
  }
}
