import { MediaTypeTreePermission } from '../roles'

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
