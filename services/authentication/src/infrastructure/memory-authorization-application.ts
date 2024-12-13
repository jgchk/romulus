import type { IAuthorizationApplication } from '@romulus/authorization'

export class MemoryAuthorizationApplication implements IAuthorizationApplication {
  private permissions: Map<string, { name: string; description: string | undefined }>
  private roles: Map<
    string,
    { name: string; permissions: Set<string>; description: string | undefined }
  >
  private userRoles: Map<number, Set<string>>

  constructor() {
    this.permissions = new Map()
    this.roles = new Map()
    this.userRoles = new Map()
  }

  createPermission(name: string, description: string | undefined) {
    this.permissions.set(name, { name, description })
  }

  ensurePermissions(permissions: { name: string; description: string | undefined }[]) {
    for (const permission of permissions) {
      if (!this.permissions.has(permission.name)) {
        this.permissions.set(permission.name, permission)
      }
    }
  }

  deletePermission(name: string) {
    this.permissions.delete(name)

    for (const role of this.roles.values()) {
      role.permissions.delete(name)
    }
  }

  createRole(name: string, permissions: Set<string>, description: string | undefined) {
    this.roles.set(name, { name, permissions, description })
  }

  deleteRole(name: string) {
    this.roles.delete(name)

    for (const userRoles of this.userRoles.values()) {
      userRoles.delete(name)
    }
  }

  assignRoleToUser(userId: number, roleName: string) {
    const userRoles = this.userRoles.get(userId) ?? new Set()
    userRoles.add(roleName)
    this.userRoles.set(userId, userRoles)
  }

  hasPermission(userId: number, permission: string) {
    const userRoles = this.userRoles.get(userId) ?? new Set()
    for (const roleName of userRoles) {
      const role = this.roles.get(roleName)
      if (role?.permissions.has(permission)) {
        return true
      }
    }

    return false
  }
}
