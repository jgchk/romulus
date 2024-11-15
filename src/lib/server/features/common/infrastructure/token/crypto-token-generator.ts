import type { TokenGenerator } from '../../domain/token-generator'
import { InvalidTokenLengthError } from '../errors/invalid-token-length'

export class CryptoTokenGenerator implements TokenGenerator {
  generate(length: number): string {
    if (length <= 0) {
      throw new InvalidTokenLengthError(length)
    }

    // Calculate the number of bytes needed
    const byteLength = Math.ceil(length / 2)

    // Generate random values
    const randomBytes = crypto.getRandomValues(new Uint8Array(byteLength))

    return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, length)
  }
}
