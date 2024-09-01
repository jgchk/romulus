import type { InvalidTokenLengthError } from '../errors/invalid-token-length'

export type TokenGenerator = {
  generate(length: number): string | InvalidTokenLengthError
}
