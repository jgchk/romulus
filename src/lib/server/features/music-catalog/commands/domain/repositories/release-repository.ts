import type { Release } from '../aggregates/release'

export type ReleaseRepository = {
  create(release: Release): Promise<number>
}
