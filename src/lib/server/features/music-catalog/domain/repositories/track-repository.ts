import type { Track } from '../entities/track'

export type TrackRepository = {
  create(track: Track): Promise<number>
}
