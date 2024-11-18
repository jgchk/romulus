export type MediaTypeEvent = MediaTypeMetadataUpdatedEvent

export class MediaTypeMetadataUpdatedEvent {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly notes: string,
  ) {}
}
