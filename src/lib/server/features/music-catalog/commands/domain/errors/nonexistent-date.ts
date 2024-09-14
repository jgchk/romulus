import { DomainError } from './base'

export class NonexistentDateError extends DomainError {
  constructor(
    public readonly year: number,
    public readonly month?: number,
    public readonly day?: number,
  ) {
    super(
      'NonexistentDateError',
      `Date is not a real calendar date (Year: ${year}, Month: ${month}, Day: ${day})`,
    )
  }
}
