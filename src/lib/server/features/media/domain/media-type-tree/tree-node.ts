export class MediaTypeTreeNode {
  private constructor(
    public readonly id: number,
    private children: Set<number>,
  ) {}

  static create(id: number): MediaTypeTreeNode {
    return new MediaTypeTreeNode(id, new Set())
  }

  addChild(id: number): void {
    this.children.add(id)
  }

  getChildren(): Set<number> {
    return this.children
  }

  hasChild(id: number): boolean {
    return this.children.has(id)
  }
}
