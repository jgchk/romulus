import type { Track } from '../../../domain/track/track'

export type TrackRepository = {
  create(track: Track): Promise<number>
}
