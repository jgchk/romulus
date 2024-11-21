export type MediaTypeBranchesEvent =
  | MediaTypeBranchCreatedEvent
  | MediaTypeBranchedFromAnotherBranchEvent
  | MediaTypeAddedInBranchEvent
  | MediaTypeRemovedFromBranchEvent
  | ParentAddedToMediaTypeInBranchEvent
  | MediaTypeBranchesMerged

export type MediaTypeTreeEvent =
  | MediaTypeAddedInBranchEvent
  | MediaTypeRemovedFromBranchEvent
  | ParentAddedToMediaTypeInBranchEvent

export class MediaTypeBranchCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

export class MediaTypeBranchedFromAnotherBranchEvent {
  constructor(
    public readonly baseBranchId: string,
    public readonly newBranchId: string,
    public readonly newBranchName: string,
  ) {}
}

export class MediaTypeAddedInBranchEvent {
  constructor(
    public readonly branchId: string,
    public readonly mediaTypeId: string,
    public readonly mediaTypeName: string,
  ) {}
}

export class MediaTypeRemovedFromBranchEvent {
  constructor(
    public readonly branchId: string,
    public readonly mediaTypeId: string,
  ) {}
}

export class ParentAddedToMediaTypeInBranchEvent {
  constructor(
    public readonly branchId: string,
    public readonly childId: string,
    public readonly parentId: string,
  ) {}
}

export class MediaTypeBranchesMerged {
  constructor(
    public readonly fromBranchId: string,
    public readonly intoBranchId: string,
  ) {}
}
