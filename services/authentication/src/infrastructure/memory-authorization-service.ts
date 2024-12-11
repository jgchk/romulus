import type { IAuthorizationService } from '../domain/authorization-service'

export class MemoryAuthorizationService implements IAuthorizationService {
  private userPermissions: Map<number, Set<string>>

  constructor() {
    this.userPermissions = new Map()
  }

  setUserPermissions(userId: number, permissions: Set<string>) {
    this.userPermissions.set(userId, permissions)
  }

  hasPermission(userId: number, permission: string) {
    return this.userPermissions.get(userId)?.has(permission) ?? false
  }

  ensurePermissions() {
    // nothing to do
  }
}
