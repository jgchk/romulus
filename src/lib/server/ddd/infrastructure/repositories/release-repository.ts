import { Release } from '../../domain/release/release'
import { ReleaseAggregate } from '../../domain/release/release-aggregate'

export interface ReleaseRepository {
  findById(id: number): Promise<Release | null>
  findByTitle(title: string): Promise<Release[]>
  save(release: Release): Promise<void>
  getAggregateById(id: number): Promise<ReleaseAggregate | null>
  saveAggregate(aggregate: ReleaseAggregate): Promise<void>
}
