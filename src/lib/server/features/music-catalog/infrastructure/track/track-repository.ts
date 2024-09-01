import type { Track } from '../../domain/entities/track'

export type TrackRepository = {
  create(track: Track): Promise<number>
}
