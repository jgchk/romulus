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
  private state: MediaTypeTreeState
  private uncommittedEvents: MediaTypeTreeEvent[]

  private constructor(state: MediaTypeTreeState, uncommittedEvents: MediaTypeTreeEvent[]) {
    this.state = state
    this.uncommittedEvents = uncommittedEvents
  }

  static fromEvents(events: MediaTypeTreeEvent[]): MediaTypeTree {
    const tree = new MediaTypeTree(MediaTypeTreeState.create(), [])
    for (const event of events) {
      tree.applyEvent(event)
    }
    return tree
  }

  static copyEvents(events: MediaTypeTreeEvent[]): MediaTypeTree {
    const tree = new MediaTypeTree(MediaTypeTreeState.create(), [])
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
      const error = this.state.tree.addMediaType(event.id, event.name)
      if (error instanceof Error) {
        throw error
      }

      this.state.addCommit(event.commitId)
    } else if (event instanceof MediaTypeRemovedEvent) {
      const error = this.state.tree.removeMediaType(event.id)
      if (error instanceof Error) {
        throw error
      }

      this.state.addCommit(event.commitId)
    } else if (event instanceof ParentAddedToMediaTypeEvent) {
      const error = this.state.tree.addChildToMediaType(event.parentId, event.childId)
      if (error instanceof Error) {
        throw error
      }

      this.state.addCommit(event.commitId)
    } else if (event instanceof MediaTypeTreesMergedEvent) {
      const error = this.state.tree.replayMerge(event.changes)
      if (error instanceof Error) {
        throw error
      }

      this.state.addMergeCommit(event.commitId, Commit.unmarshal(event.sourceCommit))
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

    const error = this.state.tree.clone().addMediaType(id, trimmedName)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeAddedEvent(id, trimmedName, this.generateCommitId())

    this.applyEvent(event)
    this.addEvent(event)
  }

  removeMediaType(id: string): void | MediaTypeNotFoundError {
    const error = this.state.tree.clone().removeMediaType(id)
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
    const error = this.state.tree.clone().addChildToMediaType(parentId, childId)
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
    const sourceTreeCommit = sourceTree.state.getCommit()
    if (sourceTreeCommit === undefined) {
      // Source tree is empty. Nothing to merge.
      return
    }

    const changes = this.state.tree
      .clone()
      .merge(sourceTree.state.tree.clone(), baseTree.state.tree.clone())
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
    return this.state.getLastCommonCommit(other.state)
  }

  private generateCommitId(): string {
    return crypto.randomUUID()
  }
}

class MediaTypeTreeState {
  tree: MediaTypeTreeTreeState
  private commit: Commit | undefined

  private constructor(tree: MediaTypeTreeTreeState, commit: Commit | undefined) {
    this.tree = tree
    this.commit = commit
  }

  static create(): MediaTypeTreeState {
    return new MediaTypeTreeState(MediaTypeTreeTreeState.create(), undefined)
  }

  addCommit(commitId: string): void {
    const parents = []
    if (this.commit) {
      parents.push(this.commit)
    }

    const newCommit = new Commit(commitId, parents)
    this.commit = newCommit
  }

  addMergeCommit(commitId: string, sourceCommit: Commit): void {
    const parents = [sourceCommit]
    if (this.commit) {
      parents.push(this.commit)
    }

    const newCommit = new Commit(commitId, parents)
    this.commit = newCommit
  }

  getCommit(): Commit | undefined {
    return this.commit?.clone()
  }

  getLastCommonCommit(other: MediaTypeTreeState): string | undefined {
    const otherCommits = Array.from(other.getAllCommits())
    const otherCommitIds = new Set(otherCommits.map((commit) => commit.id))

    for (const commit of this.getAllCommits()) {
      if (otherCommitIds.has(commit.id)) {
        return commit.id
      }
    }
  }

  private *getAllCommits(): Generator<Commit> {
    if (!this.commit) {
      return
    }

    const queue = [this.commit]
    while (queue.length > 0) {
      const current = queue.shift()!
      yield current
      queue.push(...current.parents)
    }
  }
}

export type MarshalledCommit = {
  id: string
  parents: MarshalledCommit[]
}

class Commit {
  id: string
  parents: Commit[]

  constructor(id: string, parents: Commit[]) {
    this.id = id
    this.parents = parents
  }

  clone(): Commit {
    return new Commit(this.id, [...this.parents])
  }

  marshal(): MarshalledCommit {
    return {
      id: this.id,
      parents: this.parents.map((commit) => commit.marshal()),
    }
  }

  static unmarshal(data: MarshalledCommit): Commit {
    const parents = data.parents.map((parent) => Commit.unmarshal(parent))
    return new Commit(data.id, parents)
  }
}
