import { CustomError } from '../domain/errors/base'
import type { TokenGenerator } from '../domain/repositories/token-generator'

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

export class InvalidTokenLengthError extends CustomError {
  constructor(public length: number) {
    super('InvalidTokenLengthError', `Invalid token length: ${length}. Must be a positive integer.`)
  }
}
