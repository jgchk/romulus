import { NonexistentDateError } from '../errors/nonexistent-date'
import { ReleaseDatePrecisionError } from '../errors/release-date-precision'

export type IReleaseDate =
  | {
      year: number
      month: number
      day: number
    }
  | {
      year: number
      month: number
      day?: undefined
    }
  | {
      year: number
      month?: undefined
      day?: undefined
    }

export class ReleaseDate {
  private constructor(public readonly value: IReleaseDate) {}

  static create(
    year: number,
    month: number | undefined,
    day: number | undefined,
  ): ReleaseDate | ReleaseDatePrecisionError | NonexistentDateError {
    const releaseDate = ReleaseDate.parse(year, month, day)
    if (releaseDate instanceof ReleaseDatePrecisionError) {
      return releaseDate
    }

    if (!ReleaseDate.isValidDate(releaseDate)) {
      return new NonexistentDateError(year, month, day)
    }

    return new ReleaseDate(releaseDate)
  }

  private static parse(
    year: number,
    month: number | undefined,
    day: number | undefined,
  ): IReleaseDate | ReleaseDatePrecisionError {
    if (month !== undefined) {
      if (day !== undefined) {
        return { year, month, day }
      } else {
        return { year, month, day }
      }
    } else {
      if (day !== undefined) {
        return new ReleaseDatePrecisionError(year, month, day)
      } else {
        return { year, month, day }
      }
    }
  }

  private static isValidDate(releaseDate: IReleaseDate) {
    const { year, month, day } = releaseDate

    if (month === undefined) {
      return true
    }

    if (month < 1 || month > 12) {
      return false
    }

    if (day === undefined) {
      return true
    }

    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  }
}
