export class CommitHistory {
  private commit: Commit | undefined

  private constructor(commit: Commit | undefined) {
    this.commit = commit
  }

  static create(): CommitHistory {
    return new CommitHistory(undefined)
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

  getLastCommonCommit(other: CommitHistory): string | undefined {
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

export class Commit {
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

export type MarshalledCommit = {
  id: string
  parents: MarshalledCommit[]
}
