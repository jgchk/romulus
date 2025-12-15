import { err, ok } from 'neverthrow'
import { describe, expect, test } from 'vitest'

import {
  Authorizer,
  DefaultRoleSetEvent,
  DuplicatePermissionError,
  Permission,
  PermissionCreatedEvent,
  PermissionDeletedEvent,
  PermissionNotFoundError,
  RoleAssignedToUserEvent,
  RoleCreatedEvent,
  RoleDeletedEvent,
  RoleNotFoundError,
  RoleRemovedFromUserEvent,
} from './authorizer.js'

describe('createPermission()', () => {
  test('should create a permission', () => {
    const authorizer = Authorizer.fromEvents([])

    const result = authorizer.createPermission('permission', undefined)
    expect(result).toEqual(ok(undefined))

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([new PermissionCreatedEvent('permission', undefined)])
  })

  test('should create a permission with description', () => {
    const authorizer = Authorizer.fromEvents([])

    const result = authorizer.createPermission('permission', 'description')
    expect(result).toEqual(ok(undefined))

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([new PermissionCreatedEvent('permission', 'description')])
  })

  test('should error if a permission with the same name already exists', () => {
    const authorizer = Authorizer.fromEvents([new PermissionCreatedEvent('permission', undefined)])

    const result = authorizer.createPermission('permission', undefined)

    expect(result).toEqual(err(new DuplicatePermissionError('permission')))
  })
})

describe('ensurePermissions()', () => {
  test('should create permissions that do not exist', () => {
    const authorizer = Authorizer.fromEvents([])

    authorizer.ensurePermissions([{ name: 'permission', description: undefined }])

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([new PermissionCreatedEvent('permission', undefined)])
  })

  test('should not create permissions that already exist', () => {
    const authorizer = Authorizer.fromEvents([new PermissionCreatedEvent('permission', undefined)])

    authorizer.ensurePermissions([{ name: 'permission', description: undefined }])

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([])
  })

  test('should do nothing if no permissions are passed in', () => {
    const authorizer = Authorizer.fromEvents([])

    authorizer.ensurePermissions([])

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([])
  })
})

describe('deletePermission()', () => {
  test('should delete a permission', () => {
    const authorizer = Authorizer.fromEvents([new PermissionCreatedEvent('permission', undefined)])

    authorizer.deletePermission('permission')

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([new PermissionDeletedEvent('permission')])
  })

  test('should do nothing if the permission does not exist', () => {
    const authorizer = Authorizer.fromEvents([])

    authorizer.deletePermission('permission')

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([])
  })
})

describe('createRole()', () => {
  test('should create a role', () => {
    const authorizer = Authorizer.fromEvents([])

    const result = authorizer.createRole('role', new Set(), undefined)
    expect(result).toEqual(ok(undefined))

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([new RoleCreatedEvent('role', new Set(), undefined)])
  })

  test('should create a role with description', () => {
    const authorizer = Authorizer.fromEvents([])

    const result = authorizer.createRole('role', new Set(), 'description')
    expect(result).toEqual(ok(undefined))

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([new RoleCreatedEvent('role', new Set(), 'description')])
  })

  test('should create a role with a permission', () => {
    const authorizer = Authorizer.fromEvents([new PermissionCreatedEvent('permission', undefined)])

    const result = authorizer.createRole('role', new Set(['permission']), undefined)
    expect(result).toEqual(ok(undefined))

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([new RoleCreatedEvent('role', new Set(['permission']), undefined)])
  })

  test('should error if the permission does not exist', () => {
    const authorizer = Authorizer.fromEvents([])

    const result = authorizer.createRole('role', new Set(['permission']), undefined)

    expect(result).toEqual(err(new PermissionNotFoundError('permission')))
  })
})

describe('deleteRole()', () => {
  test('should delete a role', () => {
    const authorizer = Authorizer.fromEvents([new RoleCreatedEvent('role', new Set(), undefined)])

    authorizer.deleteRole('role')

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([new RoleDeletedEvent('role')])
  })

  test('should do nothing if the role does not exist', () => {
    const authorizer = Authorizer.fromEvents([])

    authorizer.deleteRole('role')

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([])
  })
})

describe('assignRoleToUser()', () => {
  test('should assign a role to a user', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
    ])

    const result = authorizer.assignRoleToUser(0, 'role')
    expect(result).toEqual(ok(undefined))

    const events = authorizer.getUncommittedEvents()
    expect(events).toEqual([new RoleAssignedToUserEvent(0, 'role')])
  })

  test('should error if the role does not exist', () => {
    const authorizer = Authorizer.fromEvents([])

    const result = authorizer.assignRoleToUser(0, 'role')

    expect(result).toEqual(err(new RoleNotFoundError('role')))
  })
})

describe('hasPermission()', () => {
  test('should return true if the user has the permission', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new RoleAssignedToUserEvent(0, 'role'),
    ])

    expect(authorizer.hasPermission(0, 'permission')).toBe(true)
  })

  test('should return false if the user does not have the permission', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
    ])

    expect(authorizer.hasPermission(0, 'permission')).toBe(false)
  })

  test('should return false if the permission does not exist', () => {
    const authorizer = Authorizer.fromEvents([])

    expect(authorizer.hasPermission(0, 'permission')).toBe(false)
  })

  test('should return false if the permission was deleted', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new RoleAssignedToUserEvent(0, 'role'),
      new PermissionDeletedEvent('permission'),
    ])

    expect(authorizer.hasPermission(0, 'permission')).toBe(false)
  })

  test('should return false if the role containing the permission was deleted', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new RoleAssignedToUserEvent(0, 'role'),
      new RoleDeletedEvent('role'),
    ])

    expect(authorizer.hasPermission(0, 'permission')).toBe(false)
  })

  test('should return true if the permission is part of the default role', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new DefaultRoleSetEvent('role'),
    ])

    expect(authorizer.hasPermission(0, 'permission')).toBe(true)
  })

  test('should return true if the permission is part of the default role and no user id is provided', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new DefaultRoleSetEvent('role'),
    ])

    expect(authorizer.hasPermission(undefined, 'permission')).toBe(true)
  })

  test('should return false if the permission was part of a deleted default role', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new DefaultRoleSetEvent('role'),
      new RoleDeletedEvent('role'),
    ])

    expect(authorizer.hasPermission(0, 'permission')).toEqual(false)
  })
})

describe('getPermissions()', () => {
  test('should return nothing if the user has no permissions', () => {
    const authorizer = Authorizer.fromEvents([])

    expect(authorizer.getPermissions(0)).toEqual(new Set())
  })

  test('should return the user permissions', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new RoleAssignedToUserEvent(0, 'role'),
    ])

    expect(authorizer.getPermissions(0)).toEqual(new Set(['permission']))
  })

  test('should return the default permissions if there is a default role', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new DefaultRoleSetEvent('role'),
    ])

    expect(authorizer.getPermissions(0)).toEqual(new Set(['permission']))
  })

  test('should return the default permissions if there is a default role and no user id is provided', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new DefaultRoleSetEvent('role'),
    ])

    expect(authorizer.getPermissions(undefined)).toEqual(new Set(['permission']))
  })

  test('should merge user roles and default role permissions', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('user-permission', undefined),
      new PermissionCreatedEvent('default-permission', undefined),
      new RoleCreatedEvent('user-role', new Set(['user-permission']), undefined),
      new RoleCreatedEvent('default-role', new Set(['default-permission']), undefined),
      new RoleAssignedToUserEvent(0, 'user-role'),
      new DefaultRoleSetEvent('default-role'),
    ])

    expect(authorizer.getPermissions(0)).toEqual(new Set(['user-permission', 'default-permission']))
  })

  test('should not return default permissions if the default role was deleted', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new DefaultRoleSetEvent('role'),
      new RoleDeletedEvent('role'),
    ])

    expect(authorizer.getPermissions(0)).toEqual(new Set([]))
  })
})

describe('getAllPermissions()', () => {
  test('should return nothing if there are no permissions', () => {
    const authorizer = Authorizer.fromEvents([])

    expect(authorizer.getAllPermissions()).toEqual([])
  })

  test('should return all permissions', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission1', undefined),
      new PermissionCreatedEvent('permission2', undefined),
    ])

    expect(authorizer.getAllPermissions()).toEqual([
      new Permission('permission1', undefined),
      new Permission('permission2', undefined),
    ])
  })
})

describe('setDefaultRole()', () => {
  test('should set the default role', () => {
    const authorizer = Authorizer.fromEvents([new RoleCreatedEvent('role', new Set(), undefined)])

    const result = authorizer.setDefaultRole('role')
    expect(result).toEqual(ok(undefined))

    expect(authorizer.getUncommittedEvents()).toEqual([new DefaultRoleSetEvent('role')])
  })

  test('should overwrite the default role', () => {
    const authorizer = Authorizer.fromEvents([
      new RoleCreatedEvent('role', new Set(), undefined),
      new RoleCreatedEvent('newRole', new Set(), undefined),
      new DefaultRoleSetEvent('role'),
    ])

    const result = authorizer.setDefaultRole('newRole')
    expect(result).toEqual(ok(undefined))

    expect(authorizer.getUncommittedEvents()).toEqual([new DefaultRoleSetEvent('newRole')])
  })

  test('should error if the role does not exist', () => {
    const authorizer = Authorizer.fromEvents([])

    const result = authorizer.setDefaultRole('role')

    expect(result).toEqual(err(new RoleNotFoundError('role')))
  })
})

describe('getUsersWithRole()', () => {
  test('should return empty array when no users have the role', () => {
    const authorizer = Authorizer.fromEvents([new RoleCreatedEvent('role', new Set(), undefined)])

    expect(authorizer.getUsersWithRole('role')).toEqual([])
  })

  test('should return users with the role', () => {
    const authorizer = Authorizer.fromEvents([
      new RoleCreatedEvent('role', new Set(), undefined),
      new RoleAssignedToUserEvent(1, 'role'),
      new RoleAssignedToUserEvent(2, 'role'),
    ])

    expect(authorizer.getUsersWithRole('role')).toEqual([1, 2])
  })

  test('should return empty array when role does not exist', () => {
    const authorizer = Authorizer.fromEvents([])

    expect(authorizer.getUsersWithRole('nonexistent')).toEqual([])
  })

  test('should not include users from other roles', () => {
    const authorizer = Authorizer.fromEvents([
      new RoleCreatedEvent('role1', new Set(), undefined),
      new RoleCreatedEvent('role2', new Set(), undefined),
      new RoleAssignedToUserEvent(1, 'role1'),
      new RoleAssignedToUserEvent(2, 'role2'),
    ])

    expect(authorizer.getUsersWithRole('role1')).toEqual([1])
    expect(authorizer.getUsersWithRole('role2')).toEqual([2])
  })
})

describe('removeRoleFromUser()', () => {
  test('should remove a role from a user', () => {
    const authorizer = Authorizer.fromEvents([
      new RoleCreatedEvent('role', new Set(), undefined),
      new RoleAssignedToUserEvent(1, 'role'),
    ])

    const result = authorizer.removeRoleFromUser(1, 'role')
    expect(result).toEqual(ok(undefined))

    expect(authorizer.getUncommittedEvents()).toEqual([new RoleRemovedFromUserEvent(1, 'role')])
  })

  test('should error if the role does not exist', () => {
    const authorizer = Authorizer.fromEvents([])

    const result = authorizer.removeRoleFromUser(1, 'nonexistent')

    expect(result).toEqual(err(new RoleNotFoundError('nonexistent')))
  })

  test('user should not have permission after role is removed', () => {
    const authorizer = Authorizer.fromEvents([
      new PermissionCreatedEvent('permission', undefined),
      new RoleCreatedEvent('role', new Set(['permission']), undefined),
      new RoleAssignedToUserEvent(1, 'role'),
      new RoleRemovedFromUserEvent(1, 'role'),
    ])

    expect(authorizer.hasPermission(1, 'permission')).toBe(false)
  })

  test('user should not appear in getUsersWithRole after role is removed', () => {
    const authorizer = Authorizer.fromEvents([
      new RoleCreatedEvent('role', new Set(), undefined),
      new RoleAssignedToUserEvent(1, 'role'),
      new RoleRemovedFromUserEvent(1, 'role'),
    ])

    expect(authorizer.getUsersWithRole('role')).toEqual([])
  })
})
