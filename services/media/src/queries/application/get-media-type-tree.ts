import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'

export class GetMediaTypeTreeQuery {
  constructor(public readonly treeId: string) {}
}

export type GetMediaTypeTreeQueryResult = {
  name: string
  mediaTypes: Map<string, { children: Set<string> }>
}

export class GetMediaTypeTreeQueryHandler {
  constructor(private readonly db: IDrizzleConnection) {}

  async handle(query: GetMediaTypeTreeQuery): Promise<GetMediaTypeTreeQueryResult | undefined> {
    const result = await this.db.query.mediaTypeTreeTable.findFirst({
      where: (mediaTypeTree, { eq }) => eq(mediaTypeTree.id, query.treeId),
      with: {
        mediaTypes: {
          columns: {
            id: true,
          },
          with: {
            children: {
              columns: {
                childId: true,
              },
            },
          },
        },
      },
    })

    if (!result) return

    const mediaTypes = new Map(
      result.mediaTypes.map((mediaType) => [
        mediaType.id,
        { children: new Set(mediaType.children.map((child) => child.childId)) },
      ]),
    )

    return { name: result.name, mediaTypes }
  }
}
