import type { CreateMediaTypeEvent } from './events'

export class MediaType {
  private constructor(
    public readonly id: number | undefined,
    public readonly name: string,
  ) {}

  static create(event: CreateMediaTypeEvent): MediaType {
    return new MediaType(undefined, event.name)
  }
}
