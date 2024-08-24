import type { Release } from '../../domain/release'

export type ReleaseRepository = {
  create(release: Release): Promise<number>
}
