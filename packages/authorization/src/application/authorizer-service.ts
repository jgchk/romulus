import { PermissionNotFoundError, RoleNotFoundError } from '../domain/authorizer'
import type { IAuthorizerRepository } from '../domain/repository'

export class AuthorizerService {
  constructor(private repo: IAuthorizerRepository) {}

  async createPermission(name: string, description: string | undefined): Promise<void> {
    const authorizer = await this.repo.get()
    authorizer.createPermission(name, description)
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
