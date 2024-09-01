import type { Release } from '../entities/release'

export type ReleaseRepository = {
  create(release: Release): Promise<number>
}
