export class MediaTypeParentAddedEvent {
  constructor(
    public readonly childId: number,
    public readonly parentId: number,
  ) {}
}
