import {
  MediaTypeAddedEvent,
  MediaTypeRemovedEvent,
  MediaTypeTreeCreatedEvent,
  type MediaTypeTreeEvent,
  MediaTypeTreesMergedEvent,
  ParentAddedToMediaTypeEvent,
} from '../../shared/domain/events'
import { CommitHistory } from './commit-history'
import { MediaTypeTreeNotFoundError } from './errors'
import { TreeState, type TreeStateEvent } from './tree-state'
import {
  MediaTypeAddedEvent as MediaTypeAddedToTreeEvent,
  MediaTypeRemovedEvent as MediaTypeRemovedFromTreeEvent,
  MediaTypeTreesMergedEvent as MediaTypeTreesMergedInTreeEvent,
  ParentAddedToMediaTypeEvent as ParentAddedToMediaTypeInTreeEvent,
} from './tree-state'

export class MediaTypeTree {
  private id: string
  private created: boolean
  private name: string
  private tree: TreeState
  private commitHistory: CommitHistory

  private constructor(
    id: string,
    created: boolean,
    name: string,
    tree: TreeState,
    commitHistory: CommitHistory,
  ) {
    this.id = id
    this.created = created
    this.name = name
    this.tree = tree
    this.commitHistory = commitHistory
  }

  static fromEvents(id: string, events: MediaTypeTreeEvent[]): MediaTypeTree {
    const tree = new MediaTypeTree(id, false, '', TreeState.create(), CommitHistory.create())
    for (const event of events) {
      tree.applyEvent(event)
    }
    return tree
  }

  private applyEvent(event: MediaTypeTreeEvent): void {
    if (event instanceof MediaTypeTreeCreatedEvent) {
      if (event.treeId === this.id) {
        this.created = true
        this.name = event.name

        if (event.baseTreeId !== undefined) {
          const baseTree = this.getTreeFromBranch(event.baseTreeId)
          if (baseTree instanceof MediaTypeTreeNotFoundError) throw baseTree
          this.tree = baseTree
        }
      }

      const error = this.commitHistory.createBranch(event.treeId, event.baseTreeId)
      if (error instanceof Error) throw error
    } else if (event instanceof MediaTypeAddedEvent) {
      if (event.treeId === this.id) {
        this.tree.addMediaType(event.mediaTypeId, event.name)
      }

      const error = this.commitHistory.addCommit(event.treeId, event)
      if (error instanceof Error) throw error
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      if (event.treeId === this.id) {
        this.tree.addChildToMediaType(event.parentId, event.childId)
      }

      const error = this.commitHistory.addCommit(event.treeId, event)
      if (error instanceof Error) throw error
    } else if (event instanceof MediaTypeRemovedEvent) {
      if (event.treeId === this.id) {
        this.tree.removeMediaType(event.mediaTypeId)
      }

      const error = this.commitHistory.addCommit(event.treeId, event)
      if (error instanceof Error) throw error
    } else if (event instanceof MediaTypeTreesMergedEvent) {
      if (event.targetTreeId === this.id) {
        const sourceTree = this.getTreeFromBranch(event.sourceTreeId)
        if (sourceTree instanceof MediaTypeTreeNotFoundError) throw sourceTree

        const commonCommit = this.commitHistory.getLastCommonCommit(event.sourceTreeId, this.id)
        if (commonCommit instanceof MediaTypeTreeNotFoundError) throw commonCommit
        const baseTree = this.getTreeFromCommit(commonCommit)

        this.tree.merge(sourceTree, baseTree)
      }

      const error = this.commitHistory.addMergeCommit(event.sourceTreeId, event.targetTreeId, event)
      if (error instanceof Error) throw error
    }
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

      const commonCommit = this.commitHistory.getLastCommonCommit(event.sourceTreeId, this.id)
      if (commonCommit instanceof MediaTypeTreeNotFoundError) throw commonCommit

      const baseTree = this.getTreeFromCommit(commonCommit)

      return new MediaTypeTreesMergedInTreeEvent(sourceTree, baseTree)
    }
  }

  isCreated(): boolean {
    return this.created
  }

  marshal() {
    return { name: this.name, mediaTypes: this.tree.marshal() }
  }
}
