import type { Release } from '../../domain/entities/release'

export type ReleaseRepository = {
  create(release: Release): Promise<number>
}
