export type MediaTypeTreeEvent =
  | MediaTypeAddedEvent
  | MediaTypeRemovedEvent
  | ParentAddedToMediaTypeEvent

export class MediaTypeAddedEvent {
  constructor(
    public readonly mediaTypeId: string,
    public readonly mediaTypeName: string,
  ) {}
}

export class MediaTypeRemovedEvent {
  constructor(public readonly mediaTypeId: string) {}
}

export class ParentAddedToMediaTypeEvent {
  constructor(
    public readonly childId: string,
    public readonly parentId: string,
  ) {}
}
