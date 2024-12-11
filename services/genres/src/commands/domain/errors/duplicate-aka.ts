import { DomainError } from './base'

export class DuplicateAkaError extends DomainError {
  constructor(
    public readonly aka: string,
    public readonly level: 'primary' | 'secondary' | 'tertiary',
  ) {
    super('DuplicateAkaError', `Duplicate AKA found in ${level} AKAs: ${aka}`)
  }
}
