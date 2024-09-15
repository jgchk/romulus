import type { Duration } from '../value-objects/duration'
import type { Track } from './track'

export class ReleaseTrack {
  constructor(
    public readonly track: Track,
    public readonly overrides: {
      title?: string
      artists?: number[]
      durationMs?: Duration
    } = {},
  ) {}

  override(overrides: { title?: string; artists?: number[]; durationMs?: Duration }) {
    if (overrides.title !== undefined) {
      this.overrides.title = overrides.title
    }
    if (overrides.artists !== undefined) {
      this.overrides.artists = overrides.artists
    }
    if (overrides.durationMs !== undefined) {
      this.overrides.durationMs = overrides.durationMs
    }
  }
}
