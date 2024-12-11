import { MediaTypeTreesRole } from './roles'

export class PermissionChecker {
  static canCreateTree(roles: Set<MediaTypeTreesRole>): boolean {
    return roles.has(MediaTypeTreesRole.ADMIN) || roles.has(MediaTypeTreesRole.WRITE)
  }

  static canModifyTree(
    roles: Set<MediaTypeTreesRole>,
    isOwner: boolean,
    isMainTree: boolean,
  ): boolean {
    return (
      roles.has(MediaTypeTreesRole.ADMIN) ||
      (roles.has(MediaTypeTreesRole.WRITE) && isOwner && !isMainTree)
    )
  }

  static canRequestMerge(roles: Set<MediaTypeTreesRole>): boolean {
    return roles.has(MediaTypeTreesRole.ADMIN) || roles.has(MediaTypeTreesRole.WRITE)
  }
}
