import bcryptjs from 'bcryptjs'

import type { HashRepository } from '../../../common/domain/repositories/hash'

export class BcryptHashRepository implements HashRepository {
  hash(input: string): Promise<string> {
    return bcryptjs.hash(input, 12)
  }

  compare(input: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(input, hash)
  }
}
