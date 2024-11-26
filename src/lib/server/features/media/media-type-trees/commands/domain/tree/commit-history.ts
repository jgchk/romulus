import type { MediaTypeTreeCreatedEvent, MediaTypeTreeEvent } from './events'

type CommitEvent = Exclude<MediaTypeTreeEvent, MediaTypeTreeCreatedEvent>

export class CommitHistory {
  private commits: Map<string, Commit>
  private branches = new Map<string, string>()

  private constructor(commits: Map<string, Commit>, branches: Map<string, string>) {
    this.commits = commits
    this.branches = branches
  }

  static create(): CommitHistory {
    return new CommitHistory(new Map(), new Map())
  }

  private getCommitByBranch(branchId: string): Commit | undefined {
    const commitId = this.branches.get(branchId)
    if (commitId === undefined) return
    return this.commits.get(commitId)
  }

  createBranch(branchId: string, baseBranchId: string | undefined): void {
    if (baseBranchId === undefined) {
      return
    }

    const baseCommit = this.getCommitByBranch(baseBranchId)
    if (baseCommit !== undefined) {
      this.branches.set(branchId, baseCommit.id)
    }
  }

  addCommit(branchId: string, event: CommitEvent): void {
    const branchCommit = this.getCommitByBranch(branchId)

    const parents = []
    if (branchCommit !== undefined) {
      parents.push(branchCommit.id)
    }

    const newCommit = new Commit(event.commitId, parents, event)
    this.commits.set(event.commitId, newCommit)
    this.branches.set(branchId, newCommit.id)
  }

  addMergeCommit(sourceBranchId: string, targetBranchId: string, event: CommitEvent): void {
    const sourceBranchCommit = this.getCommitByBranch(sourceBranchId)
    const targetBranch = this.getCommitByBranch(targetBranchId)

    const parents = []
    if (sourceBranchCommit) {
      parents.push(sourceBranchCommit.id)
    }
    if (targetBranch) {
      parents.push(targetBranch.id)
    }

    const newCommit = new Commit(event.commitId, parents, event)
    this.commits.set(event.commitId, newCommit)
    this.branches.set(targetBranchId, newCommit.id)
  }

  getLastCommonCommit(sourceBranchId: string, targetBranchId: string): string | undefined {
    const sourceBranch = this.branches.get(sourceBranchId)
    const targetBranch = this.branches.get(targetBranchId)

    if (!sourceBranch || !targetBranch) {
      return
    }

    const sourceCommits = Array.from(this.getAllCommitsByBranch(sourceBranchId))
    const sourceCommitIds = new Set(sourceCommits.map((commit) => commit.id))

    for (const commit of this.getAllCommitsByBranch(targetBranchId)) {
      if (sourceCommitIds.has(commit.id)) {
        return commit.id
      }
    }
  }

  *getAllCommitsByBranch(branchId: string): Generator<Commit> {
    const branchCommit = this.getCommitByBranch(branchId)
    if (!branchCommit) {
      return
    }

    const queue = [branchCommit]
    while (queue.length > 0) {
      const current = queue.shift()!
      yield current

      for (const parentCommitId of current.parents) {
        const parentCommit = this.commits.get(parentCommitId)
        if (parentCommit !== undefined) {
          queue.push(parentCommit)
        }
      }
    }
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
