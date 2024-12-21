import { vi } from 'vitest'

import type { IAuthorizationService } from '../domain/authorization'

export class MockAuthorizationService implements IAuthorizationService {
  hasPermission = vi.fn<IAuthorizationService['hasPermission']>().mockResolvedValue(true)
}
