import { Role, RoleAssignedToUserEvent } from '../domain/authorizer'
import {
  Permission,
  PermissionDeletedEvent,
  RoleCreatedEvent,
  RoleDeletedEvent,
} from '../domain/authorizer'
import { Authorizer, PermissionCreatedEvent } from '../domain/authorizer'
import type { IAuthorizerRepository } from '../domain/repository'

export class MemoryAuthorizerRepository implements IAuthorizerRepository {
  private permissions: Map<string, Permission>
  private roles: Map<string, Role>
  private userRoles: Map<number, Set<string>>

  constructor() {
    this.permissions = new Map()
    this.roles = new Map()
    this.userRoles = new Map()
  }

  get() {
    return Authorizer.fromState(this.permissions, this.roles, this.userRoles)
  }

  save(authorizer: Authorizer) {
    const events = authorizer.getUncommittedEvents()
    for (const event of events) {
      if (event instanceof PermissionCreatedEvent) {
        this.permissions.set(event.name, new Permission(event.name, event.description))
      } else if (event instanceof PermissionDeletedEvent) {
        this.permissions.delete(event.name)
      } else if (event instanceof RoleCreatedEvent) {
        this.roles.set(event.name, new Role(event.name, event.permissions, event.description))
      } else if (event instanceof RoleDeletedEvent) {
        this.roles.delete(event.name)
      } else if (event instanceof RoleAssignedToUserEvent) {
        const userRoles = this.userRoles.get(event.userId) ?? new Set()
        userRoles.add(event.roleName)
        this.userRoles.set(event.userId, userRoles)
      } else {
        event satisfies never
      }
    }
  }
}
