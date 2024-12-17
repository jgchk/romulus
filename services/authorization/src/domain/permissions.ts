export const AuthorizationPermission = {
  CreatePermissions: 'authorization:create-permissions',
} as const

export type AuthorizationPermission =
  (typeof AuthorizationPermission)[keyof typeof AuthorizationPermission]
