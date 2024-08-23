import type { Track } from '../../../domain/track/track'

export type TrackRepository = {
  findById(id: number): Promise<Track | null>
  findByTitle(title: string): Promise<Track[]>
  save(track: Track): Promise<void>
}
