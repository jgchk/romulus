import { vi } from 'vitest'

import type { IAuthorizationService } from '../domain/authorization.js'

export class MockAuthorizationService implements IAuthorizationService {
  hasPermission = vi.fn<IAuthorizationService['hasPermission']>().mockResolvedValue(true)
}
