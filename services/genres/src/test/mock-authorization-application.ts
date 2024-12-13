import type { IAuthorizationApplication } from '@romulus/authorization'
import { vi } from 'vitest'

export class MockAuthorizationApplication implements IAuthorizationApplication {
  createPermission = vi.fn<IAuthorizationApplication['createPermission']>()
  ensurePermissions = vi.fn<IAuthorizationApplication['ensurePermissions']>()
  deletePermission = vi.fn<IAuthorizationApplication['deletePermission']>()
  createRole = vi.fn<IAuthorizationApplication['createRole']>()
  deleteRole = vi.fn<IAuthorizationApplication['deleteRole']>()
  assignRoleToUser = vi.fn<IAuthorizationApplication['assignRoleToUser']>()
  hasPermission = vi.fn<IAuthorizationApplication['hasPermission']>().mockReturnValue(true)
}
