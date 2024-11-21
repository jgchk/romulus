export type MediaTypeBranchesEvent = MediaTypeBranchCreatedEvent

export class MediaTypeBranchCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseBranchId: string | undefined,
  ) {}
}
