export type MediaTypeBranchesEvent =
  | MediaTypeBranchCreatedEvent
  | MediaTypeAddedInBranchEvent
  | MediaTypeRemovedFromBranchEvent
  | ParentAddedToMediaTypeInBranchEvent
  | MediaTypeBranchesMerged

export class MediaTypeBranchCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
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
