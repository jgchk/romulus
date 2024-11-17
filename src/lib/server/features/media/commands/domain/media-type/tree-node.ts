export class MediaTypeTreeNode {
  private constructor(
    public readonly mediaTypeId: number,
    public readonly parents: Set<number>,
  ) {}
}
