import { err, ok } from 'neverthrow'
import { describe, expect, test } from 'vitest'

import { PermissionNotFoundError, RoleNotFoundError } from '../domain/authorizer'
import { AuthorizationPermission, SYSTEM_USER_ID } from '../domain/permissions'
import { MemoryAuthorizerRepository } from '../infrastructure/memory-repository'
import { AuthorizationApplication } from '.'

async function setup({ userPermissions = [] }: { userPermissions?: string[] } = {}) {
  const app = new AuthorizationApplication(new MemoryAuthorizerRepository())
  const userId = 1

  if (userPermissions.length > 0) {
    const permissions = await app.ensurePermissions(
      userPermissions.map((name) => ({ name, description: undefined })),
      SYSTEM_USER_ID,
    )
    if (permissions.isErr()) {
      expect.fail(`Failed to create user permissions: ${permissions.error.message}`)
    }

    const role = await app.createRole(
      '__user_role__',
      new Set(userPermissions),
      undefined,
      SYSTEM_USER_ID,
    )
    if (role.isErr()) {
      expect.fail(`Failed to create role for user permissions: ${role.error.message}`)
    }

    await app.assignRoleToUser(1, '__user_role__', SYSTEM_USER_ID)
  }

  return { app, userId }
}

describe('createPermission()', () => {
  test('should create a permission', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.CreatePermissions],
    })

    const result = await app.createPermission('permission', undefined, userId)

    expect(result).toEqual(ok(undefined))
  })
})

describe('deletePermission()', () => {
  test('should delete a permission', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.DeletePermissions],
    })
    const r1 = await app.createPermission('permission', undefined, SYSTEM_USER_ID)
    expect(r1).toEqual(ok(undefined))

    const result = await app.deletePermission('permission', userId)

    expect(result).toEqual(ok(undefined))
  })

  test('should do nothing if the permission does not exist', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.DeletePermissions],
    })

    const result = await app.deletePermission('permission', userId)

    expect(result).toEqual(ok(undefined))
  })
})

describe('createRole()', () => {
  test('should create a role', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.CreateRoles],
    })

    const result = await app.createRole('role', new Set(), undefined, userId)

    expect(result).toEqual(ok(undefined))
  })

  test('should create a role with a permission', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.CreateRoles],
    })
    const r1 = await app.createPermission('permission', undefined, SYSTEM_USER_ID)
    expect(r1).toEqual(ok(undefined))

    const result = await app.createRole('role', new Set(['permission']), undefined, userId)

    expect(result).toEqual(ok(undefined))
  })

  test('should error if the permission does not exist', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.CreateRoles],
    })

    const result = await app.createRole('role', new Set(['permission']), undefined, userId)

    expect(result).toEqual(err(new PermissionNotFoundError('permission')))
  })
})

describe('deleteRole()', () => {
  test('should delete a role', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.DeleteRoles],
    })
    const r1 = await app.createRole('role', new Set(), undefined, SYSTEM_USER_ID)
    expect(r1).toEqual(ok(undefined))

    const result = await app.deleteRole('role', userId)

    expect(result).toEqual(ok(undefined))
  })

  test('should do nothing if the role does not exist', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.DeleteRoles],
    })

    const result = await app.deleteRole('role', userId)

    expect(result).toEqual(ok(undefined))
  })
})

describe('assignRoleToUser()', () => {
  test('should assign a role to a user', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.AssignRoles],
    })
    const r1 = await app.createRole('role', new Set(), undefined, SYSTEM_USER_ID)
    expect(r1).toEqual(ok(undefined))

    const result = await app.assignRoleToUser(1, 'role', userId)

    expect(result).toEqual(ok(undefined))
  })

  test('should error if the role does not exist', async () => {
    const { app, userId } = await setup({
      userPermissions: [AuthorizationPermission.AssignRoles],
    })

    const result = await app.assignRoleToUser(1, 'role', userId)

    expect(result).toEqual(err(new RoleNotFoundError('role')))
  })
})

describe('checkMyPermission()', () => {
  test('should return true if the user has the permission', async () => {
    const { app, userId } = await setup()
    const r1 = await app.createPermission('permission', undefined, SYSTEM_USER_ID)
    expect(r1).toEqual(ok(undefined))
    const r2 = await app.createRole('role', new Set(['permission']), undefined, SYSTEM_USER_ID)
    expect(r2).toEqual(ok(undefined))
    const r3 = await app.assignRoleToUser(1, 'role', SYSTEM_USER_ID)
    expect(r3).toEqual(ok(undefined))

    const hasPermission = await app.checkMyPermission('permission', userId)

    expect(hasPermission).toBe(true)
  })

  test('should return false if the user does not have the permission', async () => {
    const { app, userId } = await setup()
    const r1 = await app.createPermission('permission', undefined, SYSTEM_USER_ID)
    expect(r1).toEqual(ok(undefined))
    const r2 = await app.createRole('role', new Set(['permission']), undefined, SYSTEM_USER_ID)
    expect(r2).toEqual(ok(undefined))

    const hasPermission = await app.checkMyPermission('permission', userId)

    expect(hasPermission).toBe(false)
  })

  test('should return false if the permission does not exist', async () => {
    const { app, userId } = await setup()

    const hasPermission = await app.checkMyPermission('permission', userId)

    expect(hasPermission).toBe(false)
  })

  test('should return false if the permission was deleted', async () => {
    const { app, userId } = await setup()
    const r1 = await app.createPermission('permission', undefined, SYSTEM_USER_ID)
    expect(r1).toEqual(ok(undefined))
    const r2 = await app.createRole('role', new Set(['permission']), undefined, SYSTEM_USER_ID)
    expect(r2).toEqual(ok(undefined))
    const r3 = await app.assignRoleToUser(1, 'role', SYSTEM_USER_ID)
    expect(r3).toEqual(ok(undefined))
    const r4 = await app.deletePermission('permission', SYSTEM_USER_ID)
    expect(r4).toEqual(ok(undefined))

    const hasPermission = await app.checkMyPermission('permission', userId)

    expect(hasPermission).toBe(false)
  })

  test('should return false if the role containing the permission was deleted', async () => {
    const { app, userId } = await setup()
    const r1 = await app.createPermission('permission', undefined, SYSTEM_USER_ID)
    expect(r1).toEqual(ok(undefined))
    const r2 = await app.createRole('role', new Set(['permission']), undefined, SYSTEM_USER_ID)
    expect(r2).toEqual(ok(undefined))
    const r3 = await app.assignRoleToUser(1, 'role', SYSTEM_USER_ID)
    expect(r3).toEqual(ok(undefined))
    const r4 = await app.deleteRole('role', SYSTEM_USER_ID)
    expect(r4).toEqual(ok(undefined))

    const hasPermission = await app.checkMyPermission('permission', userId)

    expect(hasPermission).toBe(false)
  })
})
