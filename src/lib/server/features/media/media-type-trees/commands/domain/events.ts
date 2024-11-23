import type { MarshalledCommit } from './commit-history'
import type { MergeChange } from './tree-state'

export type MediaTypeTreeEvent =
  | MediaTypeTreeNamedEvent
  | MediaTypeAddedEvent
  | MediaTypeRemovedEvent
  | ParentAddedToMediaTypeEvent
  | MediaTypeTreesMergedEvent

export class MediaTypeTreeNamedEvent {
  constructor(public readonly name: string) {}
}

export class MediaTypeAddedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly commitId: string,
  ) {}
}

export class MediaTypeRemovedEvent {
  constructor(
    public readonly id: string,
    public readonly commitId: string,
  ) {}
}

export class ParentAddedToMediaTypeEvent {
  constructor(
    public readonly childId: string,
    public readonly parentId: string,
    public readonly commitId: string,
  ) {}
}

export class MediaTypeTreesMergedEvent {
  constructor(
    public readonly changes: MergeChange[],
    public readonly sourceCommit: MarshalledCommit,
    public readonly commitId: string,
  ) {}
}
