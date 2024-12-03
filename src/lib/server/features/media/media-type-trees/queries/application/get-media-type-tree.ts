import { MediaTypeTreeNotFoundError } from '../domain/errors'
import type { IMediaTypeTreeRepository } from '../domain/repository'

export class GetMediaTypeTreeQuery {
  constructor(public readonly treeId: string) {}
}

export type GetMediaTypeTreeQueryResult = {
  name: string
  mediaTypes: Map<string, { children: Set<string> }>
}

export class GetMediaTypeTreeQueryHandler {
  constructor(private readonly treeRepo: IMediaTypeTreeRepository) {}

  async handle(
    query: GetMediaTypeTreeQuery,
  ): Promise<GetMediaTypeTreeQueryResult | MediaTypeTreeNotFoundError> {
    const tree = await this.treeRepo.get(query.treeId)

    if (!tree.isCreated()) {
      return new MediaTypeTreeNotFoundError(query.treeId)
    }

    return tree.marshal()
  }
}
