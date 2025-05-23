import { errAsync, okAsync, ResultAsync } from 'neverthrow'

import { UnauthorizedError } from '../domain/authorizer.js'
import { AuthorizationPermission, SYSTEM_USER_ID } from '../domain/permissions.js'
import type { IAuthorizerRepository } from '../domain/repository.js'

export class AuthorizationApplication {
  constructor(private repo: IAuthorizerRepository) {}

  createPermission(name: string, description: string | undefined, requestorUserId: number) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.CreatePermissions)
      .map(() => this.repo.get())
      .andThrough((authorizer) => authorizer.createPermission(name, description))
      .map((authorizer) => this.repo.save(authorizer))
  }

  ensurePermissions(
    permissions: { name: string; description: string | undefined }[],
    requestorUserId: number,
  ) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.CreatePermissions)
      .map(() => this.repo.get())
      .andTee((authorizer) => authorizer.ensurePermissions(permissions))
      .map((authorizer) => this.repo.save(authorizer))
  }

  deletePermission(name: string, requestorUserId: number) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.DeletePermissions)
      .map(() => this.repo.get())
      .andTee((authorizer) => authorizer.deletePermission(name))
      .map((authorizer) => this.repo.save(authorizer))
  }

  createRole(
    name: string,
    permissions: Set<string>,
    description: string | undefined,
    requestorUserId: number,
  ) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.CreateRoles)
      .map(() => this.repo.get())
      .andThrough((authorizer) => authorizer.createRole(name, permissions, description))
      .map((authorizer) => this.repo.save(authorizer))
  }

  deleteRole(name: string, requestorUserId: number) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.DeleteRoles)
      .map(() => this.repo.get())
      .andTee((authorizer) => authorizer.deleteRole(name))
      .map((authorizer) => this.repo.save(authorizer))
  }

  setDefaultRole(name: string, requestorUserId: number) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.SetDefaultRole)
      .map(() => this.repo.get())
      .andThrough((authorizer) => authorizer.setDefaultRole(name))
      .map((authorizer) => this.repo.save(authorizer))
  }

  assignRoleToUser(userId: number, roleName: string, requestorUserId: number) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.AssignRoles)
      .map(() => this.repo.get())
      .andThrough((authorizer) => authorizer.assignRoleToUser(userId, roleName))
      .map((authorizer) => this.repo.save(authorizer))
  }

  async checkMyPermission(permission: string, requestorUserId: number | undefined) {
    const authorizer = await this.repo.get()
    return authorizer.hasPermission(requestorUserId, permission)
  }

  checkUserPermission(userId: number, permission: string, requestorUserId: number) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.CheckUserPermissions)
      .map(() => this.repo.get())
      .map((authorizer) => authorizer.hasPermission(userId, permission))
  }

  getMyPermissions(requestorUserId: number | undefined) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.GetOwnPermissions)
      .map(() => this.repo.get())
      .map((authorizer) => authorizer.getPermissions(requestorUserId))
  }

  getUserPermissions(userId: number, requestorUserId: number) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.GetUserPermissions)
      .map(() => this.repo.get())
      .map((authorizer) => authorizer.getPermissions(userId))
  }

  getAllPermissions(requestorUserId: number) {
    return this.checkPermission(requestorUserId, AuthorizationPermission.GetAllPermissions)
      .map(() => this.repo.get())
      .map((authorizer) => authorizer.getAllPermissions())
  }

  getSystemUserId() {
    return SYSTEM_USER_ID
  }

  private checkPermission(userId: number | undefined, permission: string) {
    if (userId === SYSTEM_USER_ID) return okAsync(undefined)

    return ResultAsync.fromSafePromise(this.repo.get())
      .map((authorizer) => authorizer.hasPermission(userId, permission))
      .andThen((hasPermission) => {
        if (!hasPermission) return errAsync(new UnauthorizedError())
        return okAsync(undefined)
      })
  }
}

export async function setupAuthorizationPermissions(
  createPermissions: (
    permissions: { name: string; description: string | undefined }[],
  ) => Promise<void>,
) {
  await createPermissions(
    Object.values(AuthorizationPermission).map((permission) => ({
      name: permission,
      description: undefined,
    })),
  )
}
