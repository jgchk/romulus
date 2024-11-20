import type { MaybePromise } from '$lib/utils/types'

import { MediaTypeBranches } from '../domain/branches'
import type { IMediaTypeBranchesRepository } from '../domain/repository'

export class MemoryMediaTypeBranchesRepository implements IMediaTypeBranchesRepository {
  private branches: MediaTypeBranches

  private constructor(branches: MediaTypeBranches) {
    this.branches = branches
  }

  static create() {
    return new MemoryMediaTypeBranchesRepository(MediaTypeBranches.create())
  }

  get(): MaybePromise<MediaTypeBranches> {
    return this.branches
  }

  save(branches: MediaTypeBranches): MaybePromise<void> {
    this.branches = branches
  }
}
