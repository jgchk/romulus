import type { Track } from '../../../domain/track'

export type TrackRepository = {
  create(track: Track): Promise<number>
}
