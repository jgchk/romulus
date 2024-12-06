export class Authorizer {
  private permissions: Map<string, Permission>
  private roles: Map<string, Role>
  private userRoles: Map<number, Set<string>>
  private uncommittedEvents: AuthorizerEvent[]

  private constructor() {
    this.permissions = new Map()
    this.roles = new Map()
    this.userRoles = new Map()
    this.uncommittedEvents = []
  }

  static fromState(
    permissions: Map<string, Permission>,
    roles: Map<string, Role>,
    userRoles: Map<number, Set<string>>,
  ): Authorizer {
    const authorizer = new Authorizer()
    authorizer.permissions = permissions
    authorizer.roles = roles
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

  createPermission(name: string, description: string | undefined): void {
    const event = new PermissionCreatedEvent(name, description)
    this.applyEvent(event)
    this.addEvent(event)
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
  ): void | PermissionNotFoundError {
    for (const permission of permissions) {
      if (!this.permissions.has(permission)) {
        return new PermissionNotFoundError(permission)
      }
    }

    const event = new RoleCreatedEvent(name, permissions, description)
    this.applyEvent(event)
    this.addEvent(event)
  }

  deleteRole(name: string): void {
    if (!this.roles.has(name)) return

    const event = new RoleDeletedEvent(name)
    this.applyEvent(event)
    this.addEvent(event)
  }

  assignRoleToUser(userId: number, roleName: string): void | RoleNotFoundError {
    if (!this.roles.has(roleName)) {
      return new RoleNotFoundError(roleName)
    }

    const event = new RoleAssignedToUserEvent(userId, roleName)
    this.applyEvent(event)
    this.addEvent(event)
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

  hasPermission(userId: number, permission: string): boolean {
    const userRoles = this.userRoles.get(userId) ?? new Set()
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId)
      if (role?.permissions.has(permission)) {
        return true
      }
    }

    return false
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

export class RoleAssignedToUserEvent {
  constructor(
    public readonly userId: number,
    public readonly roleName: string,
  ) {}
}

export class CustomError extends Error {
  constructor(name: string, message: string) {
    super(message)
    this.name = name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class PermissionNotFoundError extends CustomError {
  constructor(public readonly name: string) {
    super('PermissionNotFoundError', `No permission found with name: ${name}`)
  }
}

export class RoleNotFoundError extends CustomError {
  constructor(public readonly name: string) {
    super('RoleNotFoundError', `No role found with name: ${name}`)
  }
}
