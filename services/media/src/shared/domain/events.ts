export type MediaTypeTreeEvent =
  | MediaTypeTreeCreatedEvent
  | MediaTypeAddedEvent
  | MediaTypeRemovedEvent
  | ParentAddedToMediaTypeEvent
  | MediaTypeMergeRequestedEvent
  | MediaTypeTreesMergedEvent
  | MainMediaTypeTreeSetEvent

export class MediaTypeTreeCreatedEvent {
  constructor(
    public readonly treeId: string,
    public readonly name: string,
    public readonly baseTreeId: string | undefined,
    public readonly ownerUserId: number,
  ) {}
}

export class MediaTypeAddedEvent {
  constructor(
    public readonly treeId: string,
    public readonly mediaTypeId: string,
    public readonly name: string,
    public readonly commitId: string,
  ) {}
}

export class MediaTypeRemovedEvent {
  constructor(
    public readonly treeId: string,
    public readonly mediaTypeId: string,
    public readonly commitId: string,
  ) {}
}

export class ParentAddedToMediaTypeEvent {
  constructor(
    public readonly treeId: string,
    public readonly childId: string,
    public readonly parentId: string,
    public readonly commitId: string,
  ) {}
}

export class MediaTypeMergeRequestedEvent {
  constructor(
    public readonly mergeRequestId: string,
    public readonly sourceTreeId: string,
    public readonly targetTreeId: string,
    public readonly userId: number,
  ) {}
}

export class MediaTypeTreesMergedEvent {
  constructor(
    public readonly sourceTreeId: string,
    public readonly targetTreeId: string,
    public readonly commitId: string,
    public readonly mergeRequestId?: string,
  ) {}
}

export class MainMediaTypeTreeSetEvent {
  constructor(
    public readonly mediaTypeTreeId: string,
    public readonly userId: number,
  ) {}
}
