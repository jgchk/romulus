import { Track } from '../../domain/track/track'
import { TrackAggregate } from '../../domain/track/track-aggregate'

export interface TrackRepository {
  findById(id: number): Promise<Track | null>
  findByTitle(title: string): Promise<Track[]>
  save(track: Track): Promise<void>
  getAggregateById(id: number): Promise<TrackAggregate | null>
  saveAggregate(aggregate: TrackAggregate): Promise<void>
}
