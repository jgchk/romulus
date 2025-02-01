import { DomainError } from './base.js'

export class DuplicateAkaError extends DomainError<'DuplicateAkaError'> {
  constructor(
    public readonly aka: string,
    public readonly level: 'primary' | 'secondary' | 'tertiary',
  ) {
    super('DuplicateAkaError', `Duplicate AKA found in ${level} AKAs: ${aka}`)
  }
}
