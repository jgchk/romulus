/*
 *
 * RELEASE
 */
export type Release = {
  title: string
  things: Thing[]
}

/*
 *
 * THING
 */
type Thing = {
  set: Set
} & (CD | Record | DigitalFiles)

type CD = {
  type: 'r' | 'rw' | null
  size: number
}

type Record = {
  size: number
}

type DigitalFiles = {
  streaming: { platform: string } | null
  lossless: boolean
}

/*
 *
 * SET
 */
type Set = {
  units: Unit[]
}

/*
 *
 * UNIT
 */
type Unit = MusicTrack | TVEpisode

type MusicTrack = {
  title: string
  artists: Person[]
  releaseDate: Date
  duration: number
}

type TVEpisode = {
  title: string
  actors: Person[]
  releaseDate: Date
  duration: number
}

/*
 *
 * PERSON
 */
type Person = {
  name: string
}
