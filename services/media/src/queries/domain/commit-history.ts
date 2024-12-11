import type {
  MainMediaTypeTreeSetEvent,
  MediaTypeMergeRequestedEvent,
  MediaTypeTreeCreatedEvent,
  MediaTypeTreeEvent,
} from '../../shared/domain/events'
import { MediaTypeTreeNotFoundError } from './errors'

type CommitEvent = Exclude<
  MediaTypeTreeEvent,
  MediaTypeTreeCreatedEvent | MediaTypeMergeRequestedEvent | MainMediaTypeTreeSetEvent
>

export class CommitHistory {
  private commits: Map<string, Commit>
  private branches = new Map<string, string | null>()

  private constructor(commits: Map<string, Commit>, branches: Map<string, string>) {
    this.commits = commits
    this.branches = branches
  }

  static create(): CommitHistory {
    return new CommitHistory(new Map(), new Map())
  }

  private getCommitByBranch(branchId: string): Commit | undefined | MediaTypeTreeNotFoundError {
    const commitId = this.branches.get(branchId)
    if (commitId === null) return
    if (commitId === undefined) return new MediaTypeTreeNotFoundError(branchId)
    return this.commits.get(commitId)
  }

  createBranch(
    branchId: string,
    baseBranchId: string | undefined,
  ): void | MediaTypeTreeNotFoundError {
    if (baseBranchId === undefined) {
      this.branches.set(branchId, null)
      return
    }

    const baseCommit = this.getCommitByBranch(baseBranchId)
    if (baseCommit instanceof MediaTypeTreeNotFoundError) return baseCommit

    if (baseCommit === undefined) {
      this.branches.set(branchId, null)
    } else {
      this.branches.set(branchId, baseCommit.id)
    }
  }

  addCommit(branchId: string, event: CommitEvent): void | MediaTypeTreeNotFoundError {
    const branchCommit = this.getCommitByBranch(branchId)
    if (branchCommit instanceof MediaTypeTreeNotFoundError) return branchCommit

    const parents: string[] = []
    if (branchCommit !== undefined) {
      parents.push(branchCommit.id)
    }

    const newCommit = new Commit(event.commitId, parents, event)
    this.commits.set(event.commitId, newCommit)
    this.branches.set(branchId, newCommit.id)
  }

  addMergeCommit(
    sourceBranchId: string,
    targetBranchId: string,
    event: CommitEvent,
  ): void | MediaTypeTreeNotFoundError {
    const sourceBranchCommit = this.getCommitByBranch(sourceBranchId)
    if (sourceBranchCommit instanceof MediaTypeTreeNotFoundError) return sourceBranchCommit

    const targetBranchCommit = this.getCommitByBranch(targetBranchId)
    if (targetBranchCommit instanceof MediaTypeTreeNotFoundError) return targetBranchCommit

    const parents: string[] = []
    if (sourceBranchCommit) {
      parents.push(sourceBranchCommit.id)
    }
    if (targetBranchCommit) {
      parents.push(targetBranchCommit.id)
    }

    const newCommit = new Commit(event.commitId, parents, event)
    this.commits.set(event.commitId, newCommit)
    this.branches.set(targetBranchId, newCommit.id)
  }

  getLastCommonCommit(
    sourceBranchId: string,
    targetBranchId: string,
  ): string | undefined | MediaTypeTreeNotFoundError {
    const sourceBranch = this.branches.get(sourceBranchId)
    const targetBranch = this.branches.get(targetBranchId)

    if (!sourceBranch || !targetBranch) {
      return
    }

    const sourceCommits = this.getAllCommitsByBranch(sourceBranchId)
    if (sourceCommits instanceof MediaTypeTreeNotFoundError) return sourceCommits
    const sourceCommitIds = new Set(sourceCommits.map((commit) => commit.id))

    const targetCommits = this.getAllCommitsByBranch(targetBranchId)
    if (targetCommits instanceof MediaTypeTreeNotFoundError) return targetCommits

    for (const commit of targetCommits.reverse()) {
      if (sourceCommitIds.has(commit.id)) {
        return commit.id
      }
    }
  }

  getAllCommitsByBranch(branchId: string): Commit[] | MediaTypeTreeNotFoundError {
    const branchCommit = this.getCommitByBranch(branchId)
    if (branchCommit instanceof MediaTypeTreeNotFoundError) return branchCommit
    return this.getAllCommitsToCommit(branchCommit?.id)
  }

  getAllCommitsToCommit(commitId: string | undefined): Commit[] {
    if (commitId === undefined) {
      return []
    }

    const commit = this.commits.get(commitId)
    if (commit === undefined) {
      return []
    }

    const commits = [commit]
    const queue = [commit]
    while (queue.length > 0) {
      const current = queue.shift()!
      for (const parentCommitId of current.parents) {
        const parentCommit = this.commits.get(parentCommitId)
        if (parentCommit !== undefined) {
          commits.push(parentCommit)
          queue.push(parentCommit)
        }
      }
    }
    return commits.reverse()
  }
}

class Commit {
  id: string
  parents: string[]
  event: CommitEvent

  constructor(id: string, parents: string[], event: CommitEvent) {
    this.id = id
    this.parents = parents
    this.event = event
  }

  clone(): Commit {
    return new Commit(this.id, [...this.parents], this.event)
  }
}
