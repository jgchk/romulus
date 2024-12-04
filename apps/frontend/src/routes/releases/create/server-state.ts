import { z } from 'zod'

import type { CreateReleaseRequest } from '$lib/server/features/music-catalog/commands/application/commands/create-release'
import { CustomError } from '$lib/utils/error'
import { optionalString } from '$lib/utils/validators'

export function parseFormData(formData: string): CreateReleaseRequest | InvalidInputError {
  const maybeData = schema.safeParse(JSON.parse(formData))
  if (!maybeData.success) {
    return new InvalidInputError({
      title: maybeData.error.errors
        .filter((err) => err.path[0] === 'title')
        .map((err) => err.message),
      artists: maybeData.error.errors
        .filter((err) => err.path[0] === 'artists')
        .map((err) => err.message),
      art: maybeData.error.errors.filter((err) => err.path[0] === 'art').map((err) => err.message),
      year: maybeData.error.errors
        .filter((err) => err.path[0] === 'year')
        .map((err) => err.message),
      month: maybeData.error.errors
        .filter((err) => err.path[0] === 'month')
        .map((err) => err.message),
      day: maybeData.error.errors.filter((err) => err.path[0] === 'day').map((err) => err.message),
      tracks: maybeData.error.errors
        .filter((err) => err.path[0] === 'tracks')
        .reduce(
          (acc, err) => {
            const index = parseInt(err.path[1].toString())
            const key = err.path[2]

            acc[index] = { ...acc[index], [key]: [err.message] }

            return acc
          },
          {} as NonNullable<ReleaseErrors['tracks']>,
        ),
    })
  }
  const data = maybeData.data

  let releaseDate: CreateReleaseRequest['releaseDate']
  if (data.year === undefined) {
    if (data.month !== undefined || data.day !== undefined) {
      return new InvalidInputError({ year: ['Year is required'] })
    }
  } else {
    releaseDate = {
      year: data.year,
      month: data.month,
      day: data.day,
    }
  }

  const createReleaseRequest: CreateReleaseRequest = {
    title: data.title,
    art: data.art,
    releaseDate,
    artists: data.artists,
    tracks: [],
  }

  for (const [i, track] of data.tracks.entries()) {
    if ('id' in track) {
      createReleaseRequest.tracks.push({
        id: track.id,
        overrides: {
          title: track.overrides.title,
          artists: track.overrides.artists,
          durationMs:
            track.overrides.duration !== undefined
              ? convertToMilliseconds(track.overrides.duration)
              : undefined,
        },
      })
    } else {
      let durationMs: number | undefined = undefined
      if (track.duration.length > 0) {
        try {
          durationMs = convertToMilliseconds(track.duration)
        } catch {
          return new InvalidInputError({
            tracks: {
              [i]: { duration: ['Invalid duration format. Must be in the format HH:MM:SS'] },
            },
          })
        }
      }

      createReleaseRequest.tracks.push({
        title: track.title,
        artists: track.artists,
        durationMs,
      })
    }
  }

  return createReleaseRequest
}

export class InvalidInputError extends CustomError {
  constructor(public readonly errors: ReleaseErrors) {
    super('InvalidInputError', 'Invalid input')
  }
}

export type ReleaseErrors = Partial<{
  title: string[]
  artists: string[]
  art: string[]
  year: string[]
  month: string[]
  day: string[]
  tracks: Partial<
    Record<
      number,
      Partial<{ id: string[]; title: string[]; artists: string[]; duration: string[] }>
    >
  >
}>

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  artists: z.number().int().array().min(1, 'At least one artist is required'),
  art: optionalString,
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional(),
  tracks: z
    .object({
      title: z.string().min(1, 'Title is required'),
      artists: z.number().int().array().min(1, 'At least one artist is required'),
      duration: z.string(),
    })
    .or(
      z.object({
        id: z.number().int(),
        overrides: z.object({
          title: optionalString,
          artists: z.number().int().array().min(1, 'At least one artist is required').optional(),
          duration: optionalString,
        }),
      }),
    )
    .array(),
})

function convertToMilliseconds(input: string): number {
  const parts = input.split(':')
  let hours = 0
  let minutes = 0
  let seconds = 0

  if (parts.length === 3) {
    hours = parseFloat(parts[0])
    minutes = parseFloat(parts[1])
    seconds = parseFloat(parts[2])
  } else if (parts.length === 2) {
    minutes = parseFloat(parts[0])
    seconds = parseFloat(parts[1])
  } else if (parts.length === 1) {
    seconds = parseFloat(parts[0])
  } else {
    throw new Error('Invalid input format')
  }

  return (hours * 3600 + minutes * 60 + seconds) * 1000
}
