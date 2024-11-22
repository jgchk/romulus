import {
  MediaTypeBranchAlreadyExistsError,
  MediaTypeBranchNameInvalidError,
  MediaTypeBranchNotFoundError,
} from './errors'
import { MediaTypeBranchCreatedEvent, type MediaTypeBranchesEvent } from './events'

export class MediaTypeBranches {
  private state: MediaTypeBranchesState
  private uncommittedEvents: MediaTypeBranchesEvent[]

  private constructor(state: MediaTypeBranchesState, uncommittedEvents: MediaTypeBranchesEvent[]) {
    this.state = state
    this.uncommittedEvents = uncommittedEvents
  }

  static fromEvents(events: MediaTypeBranchesEvent[]): MediaTypeBranches {
    const mediaTypeBranches = new MediaTypeBranches(MediaTypeBranchesState.create(), [])
    for (const event of events) {
      mediaTypeBranches.applyEvent(event)
    }
    return mediaTypeBranches
  }

  getUncommittedEvents(): MediaTypeBranchesEvent[] {
    return this.uncommittedEvents
  }

  private applyEvent(event: MediaTypeBranchesEvent): void {
    if (event instanceof MediaTypeBranchCreatedEvent) {
      const error = event.baseBranchId
        ? this.state.addBranchFromBaseBranch(event.baseBranchId, event.id)
        : this.state.addBranch(event.id)
      if (error instanceof Error) {
        throw error
      }
    } else {
      // exhaustive check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = event
    }
  }

  private addEvent(event: MediaTypeBranchesEvent): void {
    this.uncommittedEvents.push(event)
  }

  createBranch(
    id: string,
    name: string,
    baseBranchId?: string,
  ): void | MediaTypeBranchAlreadyExistsError | MediaTypeBranchNameInvalidError {
    if (this.state.hasBranch(id)) {
      return new MediaTypeBranchAlreadyExistsError(id)
    }

    if (baseBranchId !== undefined && !this.state.hasBranch(baseBranchId)) {
      return new MediaTypeBranchNotFoundError(baseBranchId)
    }

    const trimmedName = name.trim().replace(/\n/g, '')
    if (trimmedName.length === 0) {
      return new MediaTypeBranchNameInvalidError(name)
    }

    const event = new MediaTypeBranchCreatedEvent(id, trimmedName, baseBranchId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  getCommonAncestor(sourceBranchId: string, targetBranchId: string): string | undefined {
    return this.state.getCommonAncestor(sourceBranchId, targetBranchId)
  }
}

class MediaTypeBranchesState {
  private branches: Map<string, Branch>
  private commits: Map<string, Commit>

  private constructor(branches: Map<string, Branch>, commits: Map<string, Commit>) {
    this.branches = branches
    this.commits = commits
  }

  static create(): MediaTypeBranchesState {
    return new MediaTypeBranchesState(new Map(), new Map())
  }

  hasBranch(id: string): boolean {
    return this.branches.has(id)
  }

  addBranch(id: string): void | MediaTypeBranchAlreadyExistsError {
    if (this.branches.has(id)) {
      return new MediaTypeBranchAlreadyExistsError(id)
    }

    this.branches.set(id, Branch.create(id))
  }

  addBranchFromBaseBranch(
    baseBranchId: string,
    newBranchId: string,
  ): void | MediaTypeBranchNotFoundError | MediaTypeBranchAlreadyExistsError {
    const baseBranch = this.branches.get(baseBranchId)
    if (!baseBranch) {
      return new MediaTypeBranchNotFoundError(baseBranchId)
    }

    if (this.branches.has(newBranchId)) {
      return new MediaTypeBranchAlreadyExistsError(newBranchId)
    }

    const baseBranchCommitId = baseBranch.getCommitId()

    const newBranch =
      baseBranchCommitId === undefined
        ? Branch.create(newBranchId)
        : Branch.fromCommit(newBranchId, baseBranchCommitId)

    this.branches.set(newBranchId, newBranch)
  }

  getCommonAncestor(sourceBranchId: string, targetBranchId: string): string | undefined {
    const sourceBranch = this.branches.get(sourceBranchId)
    const targetBranch = this.branches.get(targetBranchId)

    if (sourceBranch === undefined || targetBranch === undefined) {
      return undefined
    }

    const sourceHistory = this.getCommitHistory(sourceBranch.getCommitId())
    const targetHistory = this.getCommitHistory(targetBranch.getCommitId())

    const targetHistoryCommitIds = new Set(targetHistory.map((commit) => commit.getId()))

    // Find most recent common commit
    for (const commit of sourceHistory.reverse()) {
      const commitId = commit.getId()
      if (targetHistoryCommitIds.has(commitId)) {
        return commitId
      }
    }
  }

  private getCommitHistory(commitId: string | undefined): Commit[] {
    if (commitId === undefined) {
      return []
    }

    const history: Commit[] = []

    const queue = [commitId]
    while (queue.length > 0) {
      const currentId = queue.shift()!
      const commit = this.commits.get(currentId)
      if (commit === undefined) continue

      history.push(commit)
      queue.push(...commit.getParentIds())
    }

    return history.reverse()
  }
}

class Branch {
  private id: string
  private commitId: string | undefined

  private constructor(id: string, commitId: string | undefined) {
    this.id = id
    this.commitId = commitId
  }

  static create(id: string) {
    return new Branch(id, undefined)
  }

  static fromCommit(id: string, commitId: string) {
    return new Branch(id, commitId)
  }

  getCommitId() {
    return this.commitId
  }

  setCommitId(id: string | undefined) {
    this.commitId = id
  }
}

class Commit {
  private id: string
  private parentIds: Set<string>

  constructor(id: string, parentIds: Set<string>) {
    this.id = id
    this.parentIds = parentIds
  }

  getId(): string {
    return this.id
  }

  getParentIds(): Set<string> {
    return new Set([...this.parentIds])
  }
}
