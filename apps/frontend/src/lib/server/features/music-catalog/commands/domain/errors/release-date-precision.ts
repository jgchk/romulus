import { DomainError } from './base'

export class ReleaseDatePrecisionError extends DomainError {
  constructor(
    public readonly year: number,
    public readonly month: undefined,
    public readonly day: number,
  ) {
    super(
      'ReleaseDatePrecisionError',
      `Invalid release date precision (Year: ${year}, Month: ${month}, Day: ${day}). Cannot set a release day without a month.`,
    )
  }
}
