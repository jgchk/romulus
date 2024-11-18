export type MediaTypeTreeEvent = MediaTypeAddedEvent | MediaTypeParentAddedEvent

export class MediaTypeAddedEvent {
  constructor(public readonly id: number) {}
}

export class MediaTypeParentAddedEvent {
  constructor(
    public readonly childId: number,
    public readonly parentId: number,
  ) {}
}
