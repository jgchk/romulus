import type { Release } from '../../../domain/release/release'

export type ReleaseRepository = {
  findById(id: number): Promise<Release | null>
  findByTitle(title: string): Promise<Release[]>
  save(release: Release): Promise<void>
}
