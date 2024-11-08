import type { InvalidTokenLengthError } from '../../authentication/commands/domain/errors/invalid-token-length'

export type TokenGenerator = {
  generate(length: number): string | InvalidTokenLengthError
}
