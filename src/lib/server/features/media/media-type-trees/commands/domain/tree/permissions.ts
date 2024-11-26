import { MediaTypeTreesRole } from '../roles'

export class PermissionChecker {
  static canCreateTree(permissions: Set<MediaTypeTreesRole>): boolean {
    return permissions.has(MediaTypeTreesRole.ADMIN) || permissions.has(MediaTypeTreesRole.WRITE)
  }

  static canModifyTree(permissions: Set<MediaTypeTreesRole>, isOwner: boolean): boolean {
    return (
      permissions.has(MediaTypeTreesRole.ADMIN) ||
      (permissions.has(MediaTypeTreesRole.WRITE) && isOwner)
    )
  }
}
