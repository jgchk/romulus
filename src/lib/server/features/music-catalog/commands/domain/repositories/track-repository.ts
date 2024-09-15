import type { Track } from '../entities/track'

export type TrackRepository = {
  get(id: number): Promise<Track | undefined>
}
