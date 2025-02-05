export const SYSTEM_USER_ID = -1

export const AuthorizationPermission = {
  CreatePermissions: 'authorization:create-permissions',
  DeletePermissions: 'authorization:delete-permissions',
  CreateRoles: 'authorization:create-roles',
  DeleteRoles: 'authorization:delete-roles',
  AssignRoles: 'authorization:assign-roles',
  CheckUserPermissions: 'authorization:check-user-permissions',
  CheckOwnPermissions: 'authorization:check-own-permissions',
  GetUserPermissions: 'authorization:get-user-permissions',
  GetOwnPermissions: 'authorization:get-own-permissions',
  GetAllPermissions: 'authorization:get-all-permissions',
} as const

export type AuthorizationPermission =
  (typeof AuthorizationPermission)[keyof typeof AuthorizationPermission]
