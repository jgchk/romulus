export const MediaTypeTreePermission = {
  ADMIN: 'media-type-trees:admin',
  WRITE: 'media-type-trees:write',
} as const

export type MediaTypeTreePermission =
  (typeof MediaTypeTreePermission)[keyof typeof MediaTypeTreePermission]

export class PermissionChecker {
  static canCreateTree(permissions: Set<MediaTypeTreePermission>): boolean {
    return (
      permissions.has(MediaTypeTreePermission.ADMIN) ||
      permissions.has(MediaTypeTreePermission.WRITE)
    )
  }

  static canModifyTree(permissions: Set<MediaTypeTreePermission>, isOwner: boolean): boolean {
    return (
      permissions.has(MediaTypeTreePermission.ADMIN) ||
      (permissions.has(MediaTypeTreePermission.WRITE) && isOwner)
    )
  }
}
