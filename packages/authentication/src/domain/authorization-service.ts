import type { MaybePromise } from '../utils'

export type IAuthorizationService = {
  hasPermission(userId: number, permission: string): MaybePromise<boolean>
  ensurePermissions(
    permissions: { name: string; description: string | undefined }[],
  ): MaybePromise<void>
}
