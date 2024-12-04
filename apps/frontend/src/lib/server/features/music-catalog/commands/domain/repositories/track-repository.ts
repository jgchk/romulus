import type { Track } from '../aggregates/track'

export type TrackRepository = {
  get(id: number): Promise<Track | undefined>
  delete(id: number): Promise<void>
}
