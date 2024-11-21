export type MediaTypeBranchesEvent =
  | MediaTypeBranchCreatedEvent
  | MediaTypeBranchedFromAnotherBranchEvent

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
