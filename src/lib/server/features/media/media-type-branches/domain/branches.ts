import { MediaTypeBranch } from './branch'
import type {
  MediaTypeAlreadyExistsInBranchError,
  MediaTypeNotFoundInBranchError,
  WillCreateCycleInMediaTypeTreeError,
} from './errors'
import {
  MediaTypeBranchAlreadyExistsError,
  MediaTypeBranchNameInvalidError,
  MediaTypeBranchNotFoundError,
} from './errors'
import {
  MediaTypeAddedInBranchEvent,
  MediaTypeBranchCreatedEvent,
  type MediaTypeBranchesEvent,
  MediaTypeBranchesMerged,
  MediaTypeRemovedFromBranchEvent,
  ParentAddedToMediaTypeInBranchEvent,
} from './events'

export class MediaTypeBranches {
  private state: MediaTypeBranchesState
  private uncommittedEvents: MediaTypeBranchesEvent[]

  private constructor(state: MediaTypeBranchesState, uncommittedEvents: MediaTypeBranchesEvent[]) {
    this.state = state
    this.uncommittedEvents = uncommittedEvents
  }

  static create(): MediaTypeBranches {
    return new MediaTypeBranches(MediaTypeBranchesState.create(), [])
  }

  static fromEvents(events: MediaTypeBranchesEvent[]): MediaTypeBranches {
    const mediaTypeBranches = new MediaTypeBranches(MediaTypeBranchesState.create(), [])
    for (const event of events) {
      mediaTypeBranches.applyEvent(event)
    }
    return mediaTypeBranches
  }

  createBranch(
    id: string,
    name: string,
  ): void | MediaTypeBranchAlreadyExistsError | MediaTypeBranchNameInvalidError {
    if (this.state.hasBranch(id)) {
      return new MediaTypeBranchAlreadyExistsError(id)
    }

    const trimmedName = name
      .trim() // remove whitespace
      .replace(/\n/g, '') // remove newlines

    if (trimmedName.length === 0) {
      return new MediaTypeBranchNameInvalidError(name)
    }

    const event = new MediaTypeBranchCreatedEvent(id, trimmedName)

    this.applyEvent(event)
    this.addEvent(event)
  }

  addMediaTypeToBranch(
    branchId: string,
    mediaTypeId: string,
    mediaTypeName: string,
  ): void | MediaTypeBranchNotFoundError | MediaTypeAlreadyExistsInBranchError {
    const branch = this.state.getBranch(branchId)
    if (!branch) {
      return new MediaTypeBranchNotFoundError(branchId)
    }

    const trimmedName = mediaTypeName.trim()

    const error = branch.clone().addMediaType(mediaTypeId)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeAddedInBranchEvent(branchId, mediaTypeId, trimmedName)

    this.applyEvent(event)
    this.addEvent(event)
  }

  removeMediaTypeFromBranch(
    branchId: string,
    mediaTypeId: string,
  ): void | MediaTypeBranchNotFoundError | MediaTypeNotFoundInBranchError {
    const branch = this.state.getBranch(branchId)
    if (!branch) {
      return new MediaTypeBranchNotFoundError(branchId)
    }

    const error = branch.clone().removeMediaType(mediaTypeId)
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeRemovedFromBranchEvent(branchId, mediaTypeId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  addParentToMediaTypeInBranch(
    branchId: string,
    childMediaTypeId: string,
    parentMediaTypeId: string,
  ):
    | void
    | MediaTypeBranchNotFoundError
    | MediaTypeNotFoundInBranchError
    | WillCreateCycleInMediaTypeTreeError {
    const branch = this.state.getBranch(branchId)
    if (!branch) {
      return new MediaTypeBranchNotFoundError(branchId)
    }

    const error = branch.clone().addChildToMediaType(parentMediaTypeId, childMediaTypeId)
    if (error instanceof Error) {
      return error
    }

    const event = new ParentAddedToMediaTypeInBranchEvent(
      branchId,
      childMediaTypeId,
      parentMediaTypeId,
    )

    this.applyEvent(event)
    this.addEvent(event)
  }

  mergeBranches(
    fromBranchId: string,
    intoBranchId: string,
  ): void | MediaTypeBranchNotFoundError | WillCreateCycleInMediaTypeTreeError {
    const fromBranch = this.state.getBranch(fromBranchId)
    if (!fromBranch) {
      return new MediaTypeBranchNotFoundError(fromBranchId)
    }

    const intoBranch = this.state.getBranch(intoBranchId)
    if (!intoBranch) {
      return new MediaTypeBranchNotFoundError(intoBranchId)
    }

    const error = fromBranch.clone().mergeInto(intoBranch.clone())
    if (error instanceof Error) {
      return error
    }

    const event = new MediaTypeBranchesMerged(fromBranchId, intoBranchId)

    this.applyEvent(event)
    this.addEvent(event)
  }

  private applyEvent(event: MediaTypeBranchesEvent): void {
    if (event instanceof MediaTypeBranchCreatedEvent) {
      this.state.addBranch(event.id)
    } else if (event instanceof MediaTypeAddedInBranchEvent) {
      const branch = this.state.getBranch(event.branchId)
      if (!branch) {
        throw new MediaTypeBranchNotFoundError(event.branchId)
      }

      const error = branch.addMediaType(event.mediaTypeId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeRemovedFromBranchEvent) {
      const branch = this.state.getBranch(event.branchId)
      if (!branch) {
        throw new MediaTypeBranchNotFoundError(event.branchId)
      }

      const error = branch.removeMediaType(event.mediaTypeId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof ParentAddedToMediaTypeInBranchEvent) {
      const branch = this.state.getBranch(event.branchId)
      if (!branch) {
        throw new MediaTypeBranchNotFoundError(event.branchId)
      }

      const error = branch.addChildToMediaType(event.parentId, event.childId)
      if (error instanceof Error) {
        throw error
      }
    } else if (event instanceof MediaTypeBranchesMerged) {
      const fromBranch = this.state.getBranch(event.fromBranchId)
      if (!fromBranch) {
        throw new MediaTypeBranchNotFoundError(event.fromBranchId)
      }

      const intoBranch = this.state.getBranch(event.intoBranchId)
      if (!intoBranch) {
        throw new MediaTypeBranchNotFoundError(event.intoBranchId)
      }

      const error = fromBranch.mergeInto(intoBranch)
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

  getUncommittedEvents(): MediaTypeBranchesEvent[] {
    return this.uncommittedEvents
  }
}

class MediaTypeBranchesState {
  private branches: Map<string, MediaTypeBranch>

  private constructor(branches: Map<string, MediaTypeBranch>) {
    this.branches = branches
  }

  static create(): MediaTypeBranchesState {
    return new MediaTypeBranchesState(new Map())
  }

  hasBranch(id: string): boolean {
    return this.branches.has(id)
  }

  addBranch(id: string): void {
    this.branches.set(id, MediaTypeBranch.create(id))
  }

  getBranch(id: string): MediaTypeBranch | undefined {
    return this.branches.get(id)
  }
}
