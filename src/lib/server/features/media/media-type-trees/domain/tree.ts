import { CommitHistory } from './commit-history'
import type {
  MediaTypeAlreadyExistsError,
  MediaTypeNotFoundError,
  WillCreateCycleError,
} from './errors'
import { MediaTypeNameInvalidError, MediaTypeTreeNameInvalidError } from './errors'
import {
  MediaTypeAddedEvent,
  MediaTypeRemovedEvent,
  type MediaTypeTreeEvent,
  MediaTypeTreeNamedEvent,
  MediaTypeTreesMergedEvent,
  ParentAddedToMediaTypeEvent,
} from './events'
import { MediaTypeTreeState as MediaTypeTreeTreeState } from './tree-state'

export class MediaTypeTree {
  private tree: MediaTypeTreeTreeState
  private commitHistory: CommitHistory
  private uncommittedEvents: MediaTypeTreeEvent[]

  private constructor(
    tree: MediaTypeTreeTreeState,
    commitHistory: CommitHistory,
    uncommittedEvents: MediaTypeTreeEvent[],
  ) {
    this.tree = tree
    this.commitHistory = commitHistory
    this.uncommittedEvents = uncommittedEvents
  }

  static fromEvents(events: MediaTypeTreeEvent[]): MediaTypeTree {
    const tree = new MediaTypeTree(MediaTypeTreeTreeState.create(), CommitHistory.create(), [])
    for (const event of events) {
      tree.applyEvent(event)
    }
    return tree
  }

  static copyEvents(events: MediaTypeTreeEvent[]): MediaTypeTree {
    const tree = new MediaTypeTree(MediaTypeTreeTreeState.create(), CommitHistory.create(), [])
    for (const event of events) {
      tree.applyEvent(event)
      tree.addEvent(event)
    }
    return tree
  }

  getUncommittedEvents(): MediaTypeTreeEvent[] {
    return [...this.uncommittedEvents]
  }

  private applyEvent(event: MediaTypeTreeEvent): void {
    if (event instanceof MediaTypeTreeNamedEvent) {
      // nothing to do here
    } else if (event instanceof MediaTypeAddedEvent) {
      const error = this.tree.addMediaType(event.id, event.name)
      if (error instanceof Error) {
        throw error
      }

      this.commitHistory.addCommit(event.commitId)
    } else if (event instanceof MediaTypeRemovedEvent) {
      const error = this.tree.removeMediaType(event.id)
      if (error instanceof Error) {
        throw error
      }

      this.commitHistory.addCommit(event.commitId)
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      const error = this.tree.addChildToMediaType(event.parentId, event.childId)
      if (error instanceof Error) {
        throw error
      }

      this.commitHistory.addCommit(event.commitId)
    } else if (event instanceof MediaTypeTreesMergedEvent) {
      const error = this.tree.replayMerge(event.changes)
      if (error instanceof Error) {
        throw error
      }

      this.commitHistory.addMergeCommit(event.commitId, event.sourceCommit)
    } else {
      // exhaustive check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  private addEvent(event: MediaTypeTreeEvent): void {
    this.uncommittedEvents.push(event)
  }

  setName(name: string): void | MediaTypeTreeNameInvalidError {
    const trimmedName = name.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeTreeNameInvalidError(name)
    }

    const event = new MediaTypeTreeNamedEvent(trimmedName)

    this.applyEvent(event)
    this.addEvent(event)
  }

  addMediaType(
    id: string,
    name: string,
  ): void | MediaTypeAlreadyExistsError | MediaTypeNameInvalidError {
    const trimmedName = name.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeNameInvalidError(name)
    }

    const error = this.tree.clone().addMediaType(id, trimmedName)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeAddedEvent(id, trimmedName, this.generateCommitId())

    this.applyEvent(event)
    this.addEvent(event)
  }

  removeMediaType(id: string): void | MediaTypeNotFoundError {
    const error = this.tree.clone().removeMediaType(id)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeRemovedEvent(id, this.generateCommitId())

    this.applyEvent(event)
    this.addEvent(event)
  }

  addParentToMediaType(
    childId: string,
    parentId: string,
  ): void | MediaTypeNotFoundError | WillCreateCycleError {
    const error = this.tree.clone().addChildToMediaType(parentId, childId)
    if (error instanceof Error) {
      return error
    }

    const event = new ParentAddedToMediaTypeEvent(childId, parentId, this.generateCommitId())

    this.applyEvent(event)
    this.addEvent(event)
  }

  merge(
    sourceTree: MediaTypeTree,
    baseTree: MediaTypeTree,
  ): void | MediaTypeAlreadyExistsError | WillCreateCycleError {
    const sourceTreeCommit = sourceTree.commitHistory.getCommit()
    if (sourceTreeCommit === undefined) {
      // Source tree is empty. Nothing to merge.
      return
    }

    const changes = this.tree.clone().merge(sourceTree.tree.clone(), baseTree.tree.clone())
    if (changes instanceof Error) {
      return changes
    }

    if (changes.length === 0) {
      return
    }

    const event = new MediaTypeTreesMergedEvent(
      changes,
      sourceTreeCommit.marshal(),
      this.generateCommitId(),
    )

    this.applyEvent(event)
    this.addEvent(event)
  }

  getLastCommonCommit(other: MediaTypeTree): string | undefined {
    return this.commitHistory.getLastCommonCommit(other.commitHistory)
  }

  private generateCommitId(): string {
    return crypto.randomUUID()
  }
}
