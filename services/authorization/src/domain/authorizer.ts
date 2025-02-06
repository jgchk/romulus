import { CustomError } from '@romulus/custom-error'
import { err, ok, type Result } from 'neverthrow'

export class Authorizer {
  private permissions: Map<string, Permission>
  private roles: Map<string, Role>
  private defaultRole: string | undefined
  private userRoles: Map<number, Set<string>>
  private uncommittedEvents: AuthorizerEvent[]

  private constructor() {
    this.permissions = new Map()
    this.roles = new Map()
    this.defaultRole = undefined
    this.userRoles = new Map()
    this.uncommittedEvents = []
  }

  static fromState(
    permissions: Map<string, Permission>,
    roles: Map<string, Role>,
    defaultRole: string | undefined,
    userRoles: Map<number, Set<string>>,
  ): Authorizer {
    const authorizer = new Authorizer()
    authorizer.permissions = permissions
    authorizer.roles = roles
    authorizer.defaultRole = defaultRole
    authorizer.userRoles = userRoles
    return authorizer
  }

  static fromEvents(events: AuthorizerEvent[]): Authorizer {
    const authorizer = new Authorizer()
    for (const event of events) {
      authorizer.applyEvent(event)
    }
    return authorizer
  }

  createPermission(
    name: string,
    description: string | undefined,
  ): Result<void, DuplicatePermissionError> {
    if (this.permissions.has(name)) {
      return err(new DuplicatePermissionError(name))
    }

    const event = new PermissionCreatedEvent(name, description)
    this.applyEvent(event)
    this.addEvent(event)

    return ok(undefined)
  }

  ensurePermissions(permissions: { name: string; description: string | undefined }[]): void {
    for (const permission of permissions) {
      if (!this.permissions.has(permission.name)) {
        const event = new PermissionCreatedEvent(permission.name, permission.description)
        this.applyEvent(event)
        this.addEvent(event)
      }
    }
  }

  deletePermission(name: string): void {
    if (!this.permissions.has(name)) return

    const event = new PermissionDeletedEvent(name)
    this.applyEvent(event)
    this.addEvent(event)
  }

  createRole(
    name: string,
    permissions: Set<string>,
    description: string | undefined,
  ): Result<void, PermissionNotFoundError> {
    for (const permission of permissions) {
      if (!this.permissions.has(permission)) {
        return err(new PermissionNotFoundError(permission))
      }
    }

    const event = new RoleCreatedEvent(name, permissions, description)
    this.applyEvent(event)
    this.addEvent(event)

    return ok(undefined)
  }

  deleteRole(name: string): void {
    if (!this.roles.has(name)) return

    const event = new RoleDeletedEvent(name)
    this.applyEvent(event)
    this.addEvent(event)
  }

  setDefaultRole(name: string): Result<void, RoleNotFoundError> {
    if (!this.roles.has(name)) {
      return err(new RoleNotFoundError(name))
    }

    const event = new DefaultRoleSetEvent(name)
    this.applyEvent(event)
    this.addEvent(event)

    return ok(undefined)
  }

  assignRoleToUser(userId: number, roleName: string): Result<void, RoleNotFoundError> {
    if (!this.roles.has(roleName)) {
      return err(new RoleNotFoundError(roleName))
    }

    const event = new RoleAssignedToUserEvent(userId, roleName)
    this.applyEvent(event)
    this.addEvent(event)

    return ok(undefined)
  }

  private applyEvent(event: AuthorizerEvent): void {
    if (event instanceof PermissionCreatedEvent) {
      this.permissions.set(event.name, new Permission(event.name, event.description))
    } else if (event instanceof PermissionDeletedEvent) {
      this.permissions.delete(event.name)
      for (const role of this.roles.values()) {
        role.permissions.delete(event.name)
      }
    } else if (event instanceof RoleCreatedEvent) {
      this.roles.set(event.name, new Role(event.name, event.permissions, event.description))
    } else if (event instanceof RoleDeletedEvent) {
      this.roles.delete(event.name)
      for (const userRoles of this.userRoles.values()) {
        userRoles.delete(event.name)
      }
    } else if (event instanceof DefaultRoleSetEvent) {
      this.defaultRole = event.name
    } else if (event instanceof RoleAssignedToUserEvent) {
      const userRoles = this.userRoles.get(event.userId) ?? new Set()
      userRoles.add(event.roleName)
      this.userRoles.set(event.userId, userRoles)
    } else {
      event satisfies never
    }
  }

  private addEvent(event: AuthorizerEvent): void {
    this.uncommittedEvents.push(event)
  }

  hasPermission(userId: number | undefined, permission: string): boolean {
    const userRoles = this.getUserRoles(userId)

    for (const roleName of userRoles) {
      const role = this.roles.get(roleName)
      if (role?.permissions.has(permission)) {
        return true
      }
    }

    return false
  }

  getPermissions(userId: number | undefined): Set<string> {
    const userRoles = this.getUserRoles(userId)

    const permissions = new Set<string>()
    for (const roleName of userRoles) {
      const role = this.roles.get(roleName)
      if (role) {
        for (const permission of role.permissions) {
          permissions.add(permission)
        }
      }
    }
    return permissions
  }

  private getUserRoles(userId: number | undefined) {
    return new Set([
      ...(userId !== undefined ? (this.userRoles.get(userId) ?? []) : []),
      ...(this.defaultRole !== undefined ? [this.defaultRole] : []),
    ])
  }

  getAllPermissions(): Permission[] {
    return [...this.permissions.values()]
  }

  getUncommittedEvents(): AuthorizerEvent[] {
    return [...this.uncommittedEvents]
  }
}

export class Permission {
  constructor(
    public readonly name: string,
    public readonly description: string | undefined,
  ) {}
}

export class Role {
  constructor(
    public readonly name: string,
    public readonly permissions: Set<string>,
    public readonly description: string | undefined,
  ) {}
}

type AuthorizerEvent =
  | PermissionCreatedEvent
  | PermissionDeletedEvent
  | RoleCreatedEvent
  | RoleDeletedEvent
  | DefaultRoleSetEvent
  | RoleAssignedToUserEvent

export class PermissionCreatedEvent {
  constructor(
    public readonly name: string,
    public readonly description: string | undefined,
  ) {}
}

export class PermissionDeletedEvent {
  constructor(public readonly name: string) {}
}

export class RoleCreatedEvent {
  constructor(
    public readonly name: string,
    public readonly permissions: Set<string>,
    public readonly description: string | undefined,
  ) {}
}

export class RoleDeletedEvent {
  constructor(public readonly name: string) {}
}

export class DefaultRoleSetEvent {
  constructor(public readonly name: string) {}
}

export class RoleAssignedToUserEvent {
  constructor(
    public readonly userId: number,
    public readonly roleName: string,
  ) {}
}

export class PermissionNotFoundError extends CustomError {
  constructor(public readonly permissionName: string) {
    super('PermissionNotFoundError', `No permission found with name: ${permissionName}`)
  }
}

export class DuplicatePermissionError extends CustomError {
  constructor(public readonly permissionName: string) {
    super('DuplicatePermissionError', `Permission with name ${permissionName} already exists`)
  }
}

export class RoleNotFoundError extends CustomError {
  constructor(public readonly permissionName: string) {
    super('RoleNotFoundError', `No role found with name: ${permissionName}`)
  }
}

export class UnauthorizedError extends CustomError {
  constructor() {
    super('UnauthorizedError', 'You are not authorized to perform this action')
  }
}
