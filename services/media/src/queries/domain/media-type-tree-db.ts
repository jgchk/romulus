import { eq } from 'drizzle-orm'

import {
  MainMediaTypeTreeSetEvent,
  MediaTypeAddedEvent,
  MediaTypeRemovedEvent,
  MediaTypeTreeCreatedEvent,
  type MediaTypeTreeEvent,
  MediaTypeTreesMergedEvent,
  ParentAddedToMediaTypeEvent,
} from '../../shared/domain/events.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import {
  mediaTypeChildrenTable,
  mediaTypeTable,
  mediaTypeTreeTable,
} from '../infrastructure/drizzle-schema.js'
import { CommitHistory } from './commit-history.js'
import { MediaTypeTreeNotFoundError } from './errors.js'
import {
  MediaTypeAddedEvent as MediaTypeAddedToTreeEvent,
  MediaTypeRemovedEvent as MediaTypeRemovedFromTreeEvent,
  MediaTypeTreesMergedEvent as MediaTypeTreesMergedInTreeEvent,
  ParentAddedToMediaTypeEvent as ParentAddedToMediaTypeInTreeEvent,
} from './tree-state.js'
import { TreeState, type TreeStateEvent } from './tree-state.js'

export class MediaTypeTreesProjectionBuilder {
  private constructor(
    private db: IDrizzleConnection,
    private commitHistory: CommitHistory,
  ) {}

  static create(db: IDrizzleConnection): MediaTypeTreesProjectionBuilder {
    return new MediaTypeTreesProjectionBuilder(db, CommitHistory.create())
  }

  async receiveEvent(event: MediaTypeTreeEvent): Promise<void> {
    if (event instanceof MediaTypeTreeCreatedEvent) {
      await this.createTree(event)
    } else if (event instanceof MediaTypeAddedEvent) {
      await this.addMediaType(event)
    } else if (event instanceof MediaTypeRemovedEvent) {
      await this.removeMediaType(event)
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      await this.addParentToMediaType(event)
    } else if (event instanceof MediaTypeTreesMergedEvent) {
      await this.mergeTrees(event)
    } else if (event instanceof MainMediaTypeTreeSetEvent) {
      await this.setMainTree(event)
    }
  }

  private async createTree(event: MediaTypeTreeCreatedEvent): Promise<void> {
    const error = this.commitHistory.createBranch(event.treeId, event.baseTreeId)
    if (error instanceof Error) throw error

    await this.db.insert(mediaTypeTreeTable).values({
      id: event.treeId,
      name: event.name,
      baseTreeId: event.baseTreeId,
      ownerId: event.ownerUserId,
      isMain: false,
    })

    if (event.baseTreeId !== undefined) {
      // copy tree
      const mediaTypes = await this.db.query.mediaTypeTable.findMany({
        where: eq(mediaTypeTable.mediaTypeTreeId, event.baseTreeId),
      })
      if (mediaTypes.length > 0) {
        await this.db.insert(mediaTypeTable).values(
          mediaTypes.map((mediaType) => ({
            ...mediaType,
            mediaTypeTreeId: event.treeId,
          })),
        )
      }

      const relations = await this.db.query.mediaTypeChildrenTable.findMany({
        where: eq(mediaTypeChildrenTable.mediaTypeTreeId, event.baseTreeId),
      })
      if (relations.length > 0) {
        await this.db.insert(mediaTypeChildrenTable).values(
          relations.map((relation) => ({
            ...relation,
            mediaTypeTreeId: event.treeId,
          })),
        )
      }
    }
  }

  private async addMediaType(event: MediaTypeAddedEvent): Promise<void> {
    const error = this.commitHistory.addCommit(event.treeId, event)
    if (error instanceof Error) throw error

    await this.db.insert(mediaTypeTable).values({
      id: event.mediaTypeId,
      mediaTypeTreeId: event.treeId,
      name: event.name,
    })
  }

  private async removeMediaType(event: MediaTypeRemovedEvent): Promise<void> {
    const error = this.commitHistory.addCommit(event.treeId, event)
    if (error instanceof Error) throw error

    const parents = await this.getParents(event.mediaTypeId)
    const children = await this.getChildren(event.mediaTypeId)

    await this.db.transaction(async (tx) => {
      // move children under parents
      const relationships = parents.flatMap((parentId) =>
        children.map((childId) => ({
          mediaTypeTreeId: event.treeId,
          parentId,
          childId,
        })),
      )
      if (relationships.length > 0) {
        await tx.insert(mediaTypeChildrenTable).values(relationships).onConflictDoNothing()
      }

      await tx.delete(mediaTypeTable).where(eq(mediaTypeTable.id, event.mediaTypeId))
    })
  }

  private async addParentToMediaType(event: ParentAddedToMediaTypeEvent): Promise<void> {
    const error = this.commitHistory.addCommit(event.treeId, event)
    if (error instanceof Error) throw error

    await this.db
      .insert(mediaTypeChildrenTable)
      .values({
        mediaTypeTreeId: event.treeId,
        parentId: event.parentId,
        childId: event.childId,
      })
      .onConflictDoNothing()
  }

  private async mergeTrees(event: MediaTypeTreesMergedEvent): Promise<void> {
    const error = this.commitHistory.addMergeCommit(event.sourceTreeId, event.targetTreeId, event)
    if (error instanceof Error) throw error

    const sourceTree = this.getTreeFromBranch(event.sourceTreeId)
    if (sourceTree instanceof MediaTypeTreeNotFoundError) throw sourceTree

    const targetTree = this.getTreeFromBranch(event.targetTreeId)
    if (targetTree instanceof MediaTypeTreeNotFoundError) throw targetTree

    const commonCommit = this.commitHistory.getLastCommonCommit(
      event.sourceTreeId,
      event.targetTreeId,
    )
    if (commonCommit instanceof MediaTypeTreeNotFoundError) throw commonCommit
    const baseTree = this.getTreeFromCommit(commonCommit)

    targetTree.merge(sourceTree, baseTree)

    await this.saveTree(event.targetTreeId, targetTree)
  }

  private async setMainTree(event: MainMediaTypeTreeSetEvent): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.update(mediaTypeTreeTable).set({ isMain: false })

      await tx
        .update(mediaTypeTreeTable)
        .set({ isMain: true })
        .where(eq(mediaTypeTreeTable.id, event.mediaTypeTreeId))
    })
  }

  private async getParents(id: string): Promise<string[]> {
    const parents = await this.db.query.mediaTypeTable.findFirst({
      where: (mediaType, { eq }) => eq(mediaType.id, id),
      columns: {},
      with: {
        parents: {
          columns: {
            parentId: true,
          },
        },
      },
    })

    return parents?.parents.map((parent) => parent.parentId) ?? []
  }

  private async getChildren(id: string): Promise<string[]> {
    const children = await this.db.query.mediaTypeTable.findFirst({
      where: (mediaType, { eq }) => eq(mediaType.id, id),
      columns: {},
      with: {
        children: {
          columns: {
            childId: true,
          },
        },
      },
    })

    return children?.children.map((child) => child.childId) ?? []
  }

  private getTreeFromBranch(branchId: string): TreeState | MediaTypeTreeNotFoundError {
    const branchCommits = this.commitHistory.getAllCommitsByBranch(branchId)
    if (branchCommits instanceof MediaTypeTreeNotFoundError) return branchCommits

    const tree = TreeState.create()
    for (const { event } of branchCommits) {
      const e = this.convertToTreeEvent(event)
      if (e) {
        tree.applyEvent(e)
      }
    }
    return tree
  }

  private getTreeFromCommit(commitId: string | undefined): TreeState {
    const allCommits = this.commitHistory.getAllCommitsToCommit(commitId)

    const tree = TreeState.create()
    for (const { event } of allCommits) {
      const e = this.convertToTreeEvent(event)
      if (e) {
        tree.applyEvent(e)
      }
    }
    return tree
  }

  private convertToTreeEvent(event: MediaTypeTreeEvent): TreeStateEvent | undefined {
    if (event instanceof MediaTypeAddedEvent) {
      return new MediaTypeAddedToTreeEvent(event.mediaTypeId, event.name)
    } else if (event instanceof MediaTypeRemovedEvent) {
      return new MediaTypeRemovedFromTreeEvent(event.mediaTypeId)
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      return new ParentAddedToMediaTypeInTreeEvent(event.parentId, event.childId)
    } else if (event instanceof MediaTypeTreesMergedEvent) {
      const sourceTree = this.getTreeFromBranch(event.sourceTreeId)
      if (sourceTree instanceof MediaTypeTreeNotFoundError) throw sourceTree

      const commonCommit = this.commitHistory.getLastCommonCommit(
        event.sourceTreeId,
        event.targetTreeId,
      )
      if (commonCommit instanceof MediaTypeTreeNotFoundError) throw commonCommit

      const baseTree = this.getTreeFromCommit(commonCommit)

      return new MediaTypeTreesMergedInTreeEvent(sourceTree, baseTree)
    }
  }

  private async saveTree(treeId: string, tree: TreeState): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(mediaTypeTable).where(eq(mediaTypeTable.mediaTypeTreeId, treeId))

      const mediaTypes = [...tree.getNodes().entries()].map(([mediaTypeId, mediaType]) => ({
        id: mediaTypeId,
        mediaTypeTreeId: treeId,
        name: mediaType.getName(),
      }))
      if (mediaTypes.length > 0) {
        await tx.insert(mediaTypeTable).values(mediaTypes)
      }

      const children = [...tree.getNodes().entries()].flatMap(([parentId, parent]) =>
        [...parent.getChildren()].map((childId) => ({
          mediaTypeTreeId: treeId,
          parentId,
          childId,
        })),
      )
      if (children.length > 0) {
        await tx.insert(mediaTypeChildrenTable).values(children)
      }
    })
  }
}
