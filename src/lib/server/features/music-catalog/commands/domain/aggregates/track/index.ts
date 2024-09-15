import type { Duration } from '../../value-objects/duration'

export class Track {
  constructor(
    public readonly id: number | undefined,
    public readonly title: string,
    public readonly artists: number[],
    public readonly durationMs: Duration | undefined,
  ) {}
}
