export type MediaTypeTreeEvent =
  | MediaTypeAddedEvent
  | MediaTypeRemovedEvent
  | ParentAddedToMediaTypeEvent
  | MediaTypeTreesMergedEvent

export class MediaTypeAddedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly commitId: string = crypto.randomUUID(),
  ) {}
}

export class MediaTypeRemovedEvent {
  constructor(
    public readonly id: string,
    public readonly commitId: string = crypto.randomUUID(),
  ) {}
}

export class ParentAddedToMediaTypeEvent {
  constructor(
    public readonly childId: string,
    public readonly parentId: string,
    public readonly commitId: string = crypto.randomUUID(),
  ) {}
}

export class MediaTypeTreesMergedEvent {
  constructor(
    public readonly changes: (
      | { action: 'added'; id: string; name: string }
      | { action: 'removed'; id: string }
      | { action: 'parent-added'; childId: string; parentId: string }
    )[],
    public readonly commitId: string = crypto.randomUUID(),
  ) {}
}
