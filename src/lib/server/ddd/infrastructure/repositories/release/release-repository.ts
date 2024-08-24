import type { Release } from '../../../domain/release/release'

export type ReleaseRepository = {
  create(release: Release): Promise<number>
}
