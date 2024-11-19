import type { MediaTypeTreeEvent } from '../../media-type-tree/domain/events'

export type MediaTypeBranchEvent = MediaTypeBranchEventAddedEvent | BranchMergedEvent

export class MediaTypeBranchEventAddedEvent {
  constructor(public readonly event: MediaTypeTreeEvent) {}
}

export class BranchMergedEvent {}
