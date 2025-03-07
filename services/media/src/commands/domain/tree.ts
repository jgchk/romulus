import {
  MainMediaTypeTreeSetEvent,
  MediaTypeAddedEvent,
  MediaTypeMergeRequestedEvent,
  MediaTypeRemovedEvent,
  MediaTypeTreeCreatedEvent,
  type MediaTypeTreeEvent,
  MediaTypeTreesMergedEvent,
  ParentAddedToMediaTypeEvent,
} from '../../shared/domain/events.js'
import { CommitHistory } from './commit-history.js'
import type {
  MediaTypeAlreadyExistsError,
  MediaTypeNameInvalidError,
  MediaTypeNotFoundError,
  WillCreateCycleError,
} from './errors.js'
import {
  MediaTypeMergeRequestNotFoundError,
  MediaTypeTreeAlreadyExistsError,
  MediaTypeTreeNameInvalidError,
  MediaTypeTreeNotFoundError,
} from './errors.js'
import { TreeState, type TreeStateEvent } from './tree-state.js'
import {
  MediaTypeAddedEvent as MediaTypeAddedToTreeEvent,
  MediaTypeRemovedEvent as MediaTypeRemovedFromTreeEvent,
  MediaTypeTreesMergedEvent as MediaTypeTreesMergedInTreeEvent,
  ParentAddedToMediaTypeEvent as ParentAddedToMediaTypeInTreeEvent,
} from './tree-state.js'

export class MediaTypeTree {
  private id: string
  private tree: TreeState
  private commitHistory: CommitHistory
  private owner: number | undefined
  private mainTreeId: string | undefined
  private mergeRequests: Map<string, { sourceTreeId: string; targetTreeId: string }>
  private uncommittedEvents: MediaTypeTreeEvent[]

  private constructor(
    id: string,
    tree: TreeState,
    commitHistory: CommitHistory,
    owner: number | undefined,
    mainTreeId: string | undefined,
    mergeRequests: Map<string, { sourceTreeId: string; targetTreeId: string }>,
    uncommittedEvents: MediaTypeTreeEvent[],
  ) {
    this.id = id
    this.tree = tree
    this.commitHistory = commitHistory
    this.owner = owner
    this.mainTreeId = mainTreeId
    this.mergeRequests = mergeRequests
    this.uncommittedEvents = uncommittedEvents
  }

  static fromEvents(id: string, events: MediaTypeTreeEvent[]): MediaTypeTree {
    const tree = new MediaTypeTree(
      id,
      TreeState.create(),
      CommitHistory.create(),
      undefined,
      undefined,
      new Map(),
      [],
    )
    for (const event of events) {
      tree.applyEvent(event)
    }
    return tree
  }

  static copyEvents(id: string, events: MediaTypeTreeEvent[]): MediaTypeTree {
    const tree = new MediaTypeTree(
      id,
      TreeState.create(),
      CommitHistory.create(),
      undefined,
      undefined,
      new Map(),
      [],
    )
    for (const event of events) {
      tree.applyEvent(event)
      tree.addEvent(event)
    }
    if (tree.id === '') {
      throw new Error('Tree ID is not set')
    }
    return tree
  }

  getUncommittedEvents(): MediaTypeTreeEvent[] {
    return [...this.uncommittedEvents]
  }

  isCreated(): boolean {
    return this.owner !== undefined
  }

  private applyEvent(event: MediaTypeTreeEvent): void {
    if (event instanceof MediaTypeTreeCreatedEvent) {
      if (event.treeId === this.id) {
        this.owner = event.ownerUserId

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
        const error = this.tree.addMediaType(event.mediaTypeId, event.name)
        if (error instanceof Error) throw error
      }

      const error = this.commitHistory.addCommit(event.treeId, event)
      if (error instanceof Error) throw error
    } else if (event instanceof MediaTypeRemovedEvent) {
      if (event.treeId === this.id) {
        const error = this.tree.removeMediaType(event.mediaTypeId)
        if (error instanceof Error) throw error
      }

      const error = this.commitHistory.addCommit(event.treeId, event)
      if (error instanceof Error) throw error
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      if (event.treeId === this.id) {
        const error = this.tree.addChildToMediaType(event.parentId, event.childId)
        if (error instanceof Error) throw error
      }

      const error = this.commitHistory.addCommit(event.treeId, event)
      if (error instanceof Error) throw error
    } else if (event instanceof MediaTypeMergeRequestedEvent) {
      this.mergeRequests.set(event.mergeRequestId, {
        sourceTreeId: event.sourceTreeId,
        targetTreeId: event.targetTreeId,
      })
    } else if (event instanceof MediaTypeTreesMergedEvent) {
      if (event.targetTreeId === this.id) {
        const sourceTree = this.getTreeFromBranch(event.sourceTreeId)
        if (sourceTree instanceof MediaTypeTreeNotFoundError) throw sourceTree

        const commonCommit = this.commitHistory.getLastCommonCommit(event.sourceTreeId, this.id)
        if (commonCommit instanceof MediaTypeTreeNotFoundError) throw commonCommit
        const baseTree = this.getTreeFromCommit(commonCommit)

        const error = this.tree.merge(sourceTree, baseTree)
        if (error instanceof Error) throw error
      }

      const error = this.commitHistory.addMergeCommit(event.sourceTreeId, event.targetTreeId, event)
      if (error instanceof Error) throw error

      if (event.mergeRequestId !== undefined) {
        this.mergeRequests.delete(event.mergeRequestId)
      }
    } else if (event instanceof MainMediaTypeTreeSetEvent) {
      this.mainTreeId = event.mediaTypeTreeId
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  private addEvent(event: MediaTypeTreeEvent): void {
    this.uncommittedEvents.push(event)
  }

  create(
    name: string,
    baseTreeId: string | undefined,
    ownerUserId: number,
  ): void | MediaTypeTreeNameInvalidError | MediaTypeTreeNotFoundError {
    if (this.isCreated()) {
      return new MediaTypeTreeAlreadyExistsError(this.id)
    }

    const treeName = MediaTypeTreeName.create(name)
    if (treeName instanceof MediaTypeTreeNameInvalidError) {
      return treeName
    }

    if (baseTreeId !== undefined) {
      const baseTree = this.getTreeFromBranch(baseTreeId)
      if (baseTree instanceof MediaTypeTreeNotFoundError) return baseTree
    }

    const event = new MediaTypeTreeCreatedEvent(
      this.id,
      treeName.toString(),
      baseTreeId,
      ownerUserId,
    )

    this.applyEvent(event)
    this.addEvent(event)
  }

  addMediaType(
    id: string,
    name: string,
  ): void | MediaTypeTreeNotFoundError | MediaTypeAlreadyExistsError | MediaTypeNameInvalidError {
    if (!this.isCreated()) {
      return new MediaTypeTreeNotFoundError(this.id)
    }

    const mediaType = this.tree.clone().addMediaType(id, name)
    if (mediaType instanceof Error) {
      return mediaType
    }

    const event = new MediaTypeAddedEvent(this.id, id, mediaType.getName(), this.generateCommitId())

    this.applyEvent(event)
    this.addEvent(event)
  }

  removeMediaType(id: string): void | MediaTypeNotFoundError {
    if (!this.isCreated()) {
      return new MediaTypeTreeNotFoundError(this.id)
    }

    const error = this.tree.clone().removeMediaType(id)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeRemovedEvent(this.id, id, this.generateCommitId())

    this.applyEvent(event)
    this.addEvent(event)
  }

  addParentToMediaType(
    childId: string,
    parentId: string,
  ): void | MediaTypeTreeNotFoundError | MediaTypeNotFoundError | WillCreateCycleError {
    if (!this.isCreated()) {
      return new MediaTypeTreeNotFoundError(this.id)
    }

    const error = this.tree.clone().addChildToMediaType(parentId, childId)
    if (error instanceof Error) {
      return error
    }

    const event = new ParentAddedToMediaTypeEvent(
      this.id,
      childId,
      parentId,
      this.generateCommitId(),
    )

    this.applyEvent(event)
    this.addEvent(event)
  }

  merge(
    sourceTreeId: string,
    mergeRequestId?: string,
  ): void | MediaTypeAlreadyExistsError | WillCreateCycleError | MediaTypeTreeNotFoundError {
    if (!this.isCreated()) {
      return new MediaTypeTreeNotFoundError(this.id)
    }

    if (mergeRequestId && !this.mergeRequests.has(mergeRequestId)) {
      return new MediaTypeMergeRequestNotFoundError(mergeRequestId)
    }

    const sourceTree = this.getTreeFromBranch(sourceTreeId)
    if (sourceTree instanceof MediaTypeTreeNotFoundError) return sourceTree

    const commonCommit = this.commitHistory.getLastCommonCommit(sourceTreeId, this.id)
    if (commonCommit instanceof MediaTypeTreeNotFoundError) return commonCommit

    const baseTree = this.getTreeFromCommit(commonCommit)

    const error = this.tree.clone().merge(sourceTree, baseTree)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeTreesMergedEvent(
      sourceTreeId,
      this.id,
      this.generateCommitId(),
      mergeRequestId,
    )

    this.applyEvent(event)
    this.addEvent(event)
  }

  requestMerge(
    mergeRequestId: string,
    sourceTreeId: string,
    userId: number,
  ): void | MediaTypeTreeNotFoundError {
    if (!this.isCreated()) {
      return new MediaTypeTreeNotFoundError(this.id)
    }

    const sourceTree = this.getTreeFromBranch(sourceTreeId)
    if (sourceTree instanceof MediaTypeTreeNotFoundError) return sourceTree

    const event = new MediaTypeMergeRequestedEvent(mergeRequestId, sourceTreeId, this.id, userId)

    this.applyEvent(event)
    this.addEvent(event)
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

  setMainTree(userId: number): void | MediaTypeTreeNotFoundError {
    if (!this.isCreated()) {
      return new MediaTypeTreeNotFoundError(this.id)
    }

    const event = new MainMediaTypeTreeSetEvent(this.id, userId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  private generateCommitId(): string {
    return crypto.randomUUID()
  }

  isOwner(userId: number): boolean {
    return this.owner === userId
  }

  isMainTree(): boolean {
    return this.mainTreeId === this.id
  }
}

class MediaTypeTreeName {
  private constructor(private readonly value: string) {}

  static create(name: string): MediaTypeTreeName | MediaTypeTreeNameInvalidError {
    const trimmedName = name.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeTreeNameInvalidError(name)
    }
    return new MediaTypeTreeName(trimmedName)
  }

  toString(): string {
    return this.value
  }
}
