import { ok } from 'neverthrow'
import { vi } from 'vitest'

import { type IAuthenticationService } from '../domain/authentication.js'

export class MockAuthenticationService implements IAuthenticationService {
  whoami = vi.fn<IAuthenticationService['whoami']>().mockResolvedValue(ok({ id: 0 }))
}
