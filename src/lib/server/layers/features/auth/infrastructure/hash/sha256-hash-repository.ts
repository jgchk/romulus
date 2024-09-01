import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'

import type { HashRepository } from '../../domain/repositories/hash'

export class Sha256HashRepository implements HashRepository {
  async hash(input: string): Promise<string> {
    return encodeHex(await sha256(new TextEncoder().encode(input)))
  }

  async compare(input: string, hash: string): Promise<boolean> {
    const hashedInput = await this.hash(input)
    return hashedInput === hash
  }
}
