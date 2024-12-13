import {
  DuplicatePermissionError,
  PermissionNotFoundError,
  RoleNotFoundError,
} from '../domain/authorizer'
import type { IAuthorizerRepository } from '../domain/repository'
import type { MaybePromise } from '../utils'

export type IAuthorizationApplication = {
  createPermission(
    name: string,
    description: string | undefined,
  ): MaybePromise<void | DuplicatePermissionError>
  ensurePermissions(
    permissions: { name: string; description: string | undefined }[],
  ): MaybePromise<void>
  deletePermission(name: string): MaybePromise<void>
  createRole(
    name: string,
    permissions: Set<string>,
    description: string | undefined,
  ): MaybePromise<void | PermissionNotFoundError>
  deleteRole(name: string): MaybePromise<void>
  assignRoleToUser(userId: number, roleName: string): MaybePromise<void | RoleNotFoundError>
  hasPermission(userId: number, permission: string): MaybePromise<boolean>
}

export class AuthorizationApplication implements IAuthorizationApplication {
  constructor(private repo: IAuthorizerRepository) {}

  async createPermission(
    name: string,
    description: string | undefined,
  ): Promise<void | DuplicatePermissionError> {
    const authorizer = await this.repo.get()

    const error = authorizer.createPermission(name, description)
    if (error instanceof DuplicatePermissionError) {
      return error
    }

    await this.repo.save(authorizer)
  }

  async ensurePermissions(
    permissions: { name: string; description: string | undefined }[],
  ): Promise<void> {
    const authorizer = await this.repo.get()
    authorizer.ensurePermissions(permissions)
    await this.repo.save(authorizer)
  }

  async deletePermission(name: string): Promise<void> {
    const authorizer = await this.repo.get()
    authorizer.deletePermission(name)
    await this.repo.save(authorizer)
  }

  async createRole(
    name: string,
    permissions: Set<string>,
    description: string | undefined,
  ): Promise<void | PermissionNotFoundError> {
    const authorizer = await this.repo.get()

    const error = authorizer.createRole(name, permissions, description)
    if (error instanceof PermissionNotFoundError) {
      return error
    }

    await this.repo.save(authorizer)
  }

  async deleteRole(name: string): Promise<void> {
    const authorizer = await this.repo.get()
    authorizer.deleteRole(name)
    await this.repo.save(authorizer)
  }

  async assignRoleToUser(userId: number, roleName: string): Promise<void | RoleNotFoundError> {
    const authorizer = await this.repo.get()

    const error = authorizer.assignRoleToUser(userId, roleName)
    if (error instanceof RoleNotFoundError) {
      return error
    }

    await this.repo.save(authorizer)
  }

  async hasPermission(userId: number, permission: string): Promise<boolean> {
    const authorizer = await this.repo.get()
    return authorizer.hasPermission(userId, permission)
  }
}
