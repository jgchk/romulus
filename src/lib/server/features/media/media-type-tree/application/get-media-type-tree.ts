import type { IMediaTypeTreeRepository } from '../domain/repository'

export class GetMediaTypeTreeQuery {
  constructor(private mediaTypeTreeRepo: IMediaTypeTreeRepository) {}

  async execute(): Promise<{ id: number; children: Set<number> }[]> {
    const tree = await this.mediaTypeTreeRepo.get()
    return tree.getAll().map((node) => ({
      id: node.id,
      children: node.getChildren(),
    }))
  }
}
